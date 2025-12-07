package main

import (
	"context"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
)

var (
	redisClient *redis.Client
	upgrader    = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin:     func(r *http.Request) bool { return true },
	}
	wsClients   = make(map[*websocket.Conn]map[string]bool)
	wsClientsMu sync.RWMutex

	marketServiceURL  string
	tradingServiceURL string
	vaultServiceURL   string
	userServiceURL    string
)

func main() {
	// Service URLs from environment
	marketServiceURL = getEnv("MARKET_SERVICE_URL", "http://localhost:8081")
	tradingServiceURL = getEnv("TRADING_SERVICE_URL", "http://localhost:8082")
	vaultServiceURL = getEnv("VAULT_SERVICE_URL", "http://localhost:8083")
	userServiceURL = getEnv("USER_SERVICE_URL", "http://localhost:8084")

	// Initialize Redis
	redisURL := getEnv("REDIS_URL", "localhost:6379")
	redisClient = redis.NewClient(&redis.Options{
		Addr:     redisURL,
		PoolSize: 100,
	})
	defer redisClient.Close()

	// Start WebSocket broadcaster
	go broadcastFromRedis()

	r := mux.NewRouter()

	// Health check
	r.HandleFunc("/health", healthHandler).Methods("GET")

	// WebSocket endpoint
	r.HandleFunc("/ws", wsHandler)

	// API routes - proxy to services
	// Market routes
	r.PathPrefix("/api/v1/markets").HandlerFunc(proxyHandler(marketServiceURL))
	
	// Trading routes
	r.PathPrefix("/api/v1/positions").HandlerFunc(proxyHandler(tradingServiceURL))
	r.PathPrefix("/api/v1/orders").HandlerFunc(proxyHandler(tradingServiceURL))
	r.PathPrefix("/api/v1/balances").HandlerFunc(proxyHandler(tradingServiceURL))
	
	// Vault routes
	r.PathPrefix("/api/v1/vaults").HandlerFunc(proxyHandler(vaultServiceURL))
	
	// User routes
	r.PathPrefix("/api/v1/auth").HandlerFunc(proxyHandler(userServiceURL))
	r.PathPrefix("/api/v1/users").HandlerFunc(proxyHandler(userServiceURL))

	handler := corsMiddleware(r)

	port := getEnv("PORT", "8080")
	log.Printf("API Gateway starting on port %s", port)
	log.Printf("Market Service: %s", marketServiceURL)
	log.Printf("Trading Service: %s", tradingServiceURL)
	log.Printf("Vault Service: %s", vaultServiceURL)
	log.Printf("User Service: %s", userServiceURL)
	
	log.Fatal(http.ListenAndServe(":"+port, handler))
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-User-ID")
		
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	// Check all services health
	services := map[string]string{
		"market":  marketServiceURL,
		"trading": tradingServiceURL,
		"vault":   vaultServiceURL,
		"user":    userServiceURL,
	}

	status := make(map[string]string)
	allHealthy := true

	client := &http.Client{Timeout: 2 * time.Second}
	for name, baseURL := range services {
		resp, err := client.Get(baseURL + "/health")
		if err != nil || resp.StatusCode != http.StatusOK {
			status[name] = "unhealthy"
			allHealthy = false
		} else {
			status[name] = "healthy"
		}
		if resp != nil {
			resp.Body.Close()
		}
	}

	status["gateway"] = "healthy"
	
	w.Header().Set("Content-Type", "application/json")
	if allHealthy {
		w.WriteHeader(http.StatusOK)
	} else {
		w.WriteHeader(http.StatusServiceUnavailable)
	}
	json.NewEncoder(w).Encode(status)
}

func proxyHandler(targetBase string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		target, err := url.Parse(targetBase)
		if err != nil {
			http.Error(w, "Bad gateway", http.StatusBadGateway)
			return
		}

		proxy := httputil.NewSingleHostReverseProxy(target)
		
		// Customize director to preserve path
		originalDirector := proxy.Director
		proxy.Director = func(req *http.Request) {
			originalDirector(req)
			req.Host = target.Host
			req.URL.Path = r.URL.Path
			req.URL.RawQuery = r.URL.RawQuery
		}

		// Custom error handler
		proxy.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
			log.Printf("Proxy error: %v", err)
			http.Error(w, "Service unavailable", http.StatusServiceUnavailable)
		}

		// Modify response to add latency header
		proxy.ModifyResponse = func(resp *http.Response) error {
			resp.Header.Set("X-Gateway", "hydrox")
			return nil
		}

		proxy.ServeHTTP(w, r)
	}
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		return
	}
	defer conn.Close()

	wsClientsMu.Lock()
	wsClients[conn] = make(map[string]bool)
	wsClientsMu.Unlock()

	defer func() {
		wsClientsMu.Lock()
		delete(wsClients, conn)
		wsClientsMu.Unlock()
	}()

	// Also proxy to market service WebSocket
	marketWS, err := connectToMarketWS()
	if err != nil {
		log.Printf("Failed to connect to market WS: %v", err)
	} else {
		defer marketWS.Close()
		
		// Forward messages from market service
		go func() {
			for {
				_, msg, err := marketWS.ReadMessage()
				if err != nil {
					return
				}
				conn.WriteMessage(websocket.TextMessage, msg)
			}
		}()
	}

	// Handle client messages
	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			break
		}

		var msg struct {
			Method string   `json:"method"`
			Params []string `json:"params"`
		}
		if err := json.Unmarshal(message, &msg); err != nil {
			continue
		}

		wsClientsMu.Lock()
		if msg.Method == "SUBSCRIBE" {
			for _, channel := range msg.Params {
				wsClients[conn][channel] = true
			}
			// Forward to market service
			if marketWS != nil {
				marketWS.WriteMessage(websocket.TextMessage, message)
			}
		} else if msg.Method == "UNSUBSCRIBE" {
			for _, channel := range msg.Params {
				delete(wsClients[conn], channel)
			}
			if marketWS != nil {
				marketWS.WriteMessage(websocket.TextMessage, message)
			}
		}
		wsClientsMu.Unlock()
	}
}

func connectToMarketWS() (*websocket.Conn, error) {
	wsURL := strings.Replace(marketServiceURL, "http://", "ws://", 1) + "/ws"
	wsURL = strings.Replace(wsURL, "https://", "wss://", 1)
	
	conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	return conn, err
}

func broadcastFromRedis() {
	ctx := context.Background()
	pubsub := redisClient.Subscribe(ctx, "market:ticker", "market:trade", "market:kline", "trading:order")
	defer pubsub.Close()

	for msg := range pubsub.Channel() {
		broadcastToWsClients(msg.Channel, []byte(msg.Payload))
	}
}

func broadcastToWsClients(channel string, data []byte) {
	wsClientsMu.RLock()
	defer wsClientsMu.RUnlock()

	for conn, subs := range wsClients {
		if subs[channel] {
			conn.WriteMessage(websocket.TextMessage, data)
		}
	}
}

// Utility function to copy response body
func copyBody(r *http.Response) ([]byte, error) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		return nil, err
	}
	r.Body.Close()
	return body, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

