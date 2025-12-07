package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

var (
	db          *pgxpool.Pool
	redisClient *redis.Client
	upgrader    = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin:     func(r *http.Request) bool { return true },
	}
	clients   = make(map[*websocket.Conn]map[string]bool)
	clientsMu sync.RWMutex
)

type Ticker struct {
	Symbol             string  `json:"symbol"`
	LastPrice          float64 `json:"last_price"`
	PriceChange        float64 `json:"price_change"`
	PriceChangePercent float64 `json:"price_change_percent"`
	High24h            float64 `json:"high_24h"`
	Low24h             float64 `json:"low_24h"`
	Volume24h          float64 `json:"volume_24h"`
	QuoteVolume24h     float64 `json:"quote_volume_24h"`
	MarkPrice          float64 `json:"mark_price"`
}

type Kline struct {
	Time   int64   `json:"time"`
	Open   float64 `json:"open"`
	High   float64 `json:"high"`
	Low    float64 `json:"low"`
	Close  float64 `json:"close"`
	Volume float64 `json:"volume"`
}

type Trade struct {
	Price  float64 `json:"price"`
	Amount float64 `json:"amount"`
	Side   string  `json:"side"`
	Time   int64   `json:"time"`
}

func main() {
	// Initialize database
	var err error
	dbURL := getEnv("DATABASE_URL", "postgres://hydrox:hydrox_secret@localhost:5432/hydrox?sslmode=disable")
	db, err = pgxpool.New(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v", err)
	}
	defer db.Close()

	// Initialize Redis
	redisURL := getEnv("REDIS_URL", "localhost:6379")
	redisClient = redis.NewClient(&redis.Options{
		Addr:     redisURL,
		PoolSize: 100,
	})
	defer redisClient.Close()

	// Start Redis subscriber for broadcasting
	go subscribeToUpdates()

	// Start mock price generator (for demo)
	go generateMockPrices()

	// Setup router
	r := mux.NewRouter()
	
	// REST endpoints
	r.HandleFunc("/health", healthHandler).Methods("GET")
	r.HandleFunc("/api/v1/markets/{symbol}/ticker", getTickerHandler).Methods("GET")
	r.HandleFunc("/api/v1/markets/{symbol}/klines", getKlinesHandler).Methods("GET")
	r.HandleFunc("/api/v1/markets/{symbol}/trades", getTradesHandler).Methods("GET")
	r.HandleFunc("/api/v1/markets", getAllMarketsHandler).Methods("GET")
	
	// WebSocket endpoint
	r.HandleFunc("/ws", wsHandler)

	// CORS middleware
	handler := corsMiddleware(r)

	port := getEnv("PORT", "8081")
	log.Printf("Market service starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "healthy"})
}

func getTickerHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	symbol := vars["symbol"]

	// Try Redis cache first
	ctx := r.Context()
	cacheKey := "ticker:" + symbol
	
	cached, err := redisClient.Get(ctx, cacheKey).Result()
	if err == nil {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(cached))
		return
	}

	// Fallback to database
	var ticker Ticker
	err = db.QueryRow(ctx, `
		SELECT symbol, last_price, price_change, price_change_percent, 
		       high_24h, low_24h, volume_24h, quote_volume_24h
		FROM market_tickers WHERE symbol = $1
	`, symbol).Scan(
		&ticker.Symbol, &ticker.LastPrice, &ticker.PriceChange,
		&ticker.PriceChangePercent, &ticker.High24h, &ticker.Low24h,
		&ticker.Volume24h, &ticker.QuoteVolume24h,
	)
	if err != nil {
		http.Error(w, "Symbol not found", http.StatusNotFound)
		return
	}

	ticker.MarkPrice = ticker.LastPrice * 0.9999 // Simplified mark price

	// Cache the result
	data, _ := json.Marshal(ticker)
	redisClient.Set(ctx, cacheKey, data, 1*time.Second)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ticker)
}

func getKlinesHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	symbol := vars["symbol"]
	interval := r.URL.Query().Get("interval")
	if interval == "" {
		interval = "1h"
	}

	ctx := r.Context()
	cacheKey := "klines:" + symbol + ":" + interval

	// Try Redis cache first
	cached, err := redisClient.Get(ctx, cacheKey).Result()
	if err == nil {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(cached))
		return
	}

	// Generate klines from database or mock
	rows, err := db.Query(ctx, `
		SELECT EXTRACT(EPOCH FROM open_time)::bigint, open, high, low, close, volume
		FROM klines 
		WHERE symbol = $1 AND interval = $2
		ORDER BY open_time DESC
		LIMIT 100
	`, symbol, interval)
	if err != nil {
		http.Error(w, "Error fetching klines", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var klines []Kline
	for rows.Next() {
		var k Kline
		rows.Scan(&k.Time, &k.Open, &k.High, &k.Low, &k.Close, &k.Volume)
		klines = append(klines, k)
	}

	// If no data, return empty array
	if len(klines) == 0 {
		klines = []Kline{}
	}

	data, _ := json.Marshal(klines)
	redisClient.Set(ctx, cacheKey, data, 5*time.Second)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(klines)
}

func getTradesHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	symbol := vars["symbol"]

	ctx := r.Context()
	cacheKey := "trades:" + symbol

	// Try Redis cache first
	cached, err := redisClient.Get(ctx, cacheKey).Result()
	if err == nil {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(cached))
		return
	}

	rows, err := db.Query(ctx, `
		SELECT price, amount, side, EXTRACT(EPOCH FROM created_at)::bigint
		FROM trades 
		WHERE symbol = $1
		ORDER BY created_at DESC
		LIMIT 50
	`, symbol)
	if err != nil {
		http.Error(w, "Error fetching trades", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var trades []Trade
	for rows.Next() {
		var t Trade
		rows.Scan(&t.Price, &t.Amount, &t.Side, &t.Time)
		trades = append(trades, t)
	}

	if len(trades) == 0 {
		trades = []Trade{}
	}

	data, _ := json.Marshal(trades)
	redisClient.Set(ctx, cacheKey, data, 500*time.Millisecond)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(trades)
}

func getAllMarketsHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	
	rows, err := db.Query(ctx, `
		SELECT symbol, last_price, price_change_percent, high_24h, low_24h, volume_24h
		FROM market_tickers
	`)
	if err != nil {
		http.Error(w, "Error fetching markets", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var tickers []Ticker
	for rows.Next() {
		var t Ticker
		rows.Scan(&t.Symbol, &t.LastPrice, &t.PriceChangePercent, &t.High24h, &t.Low24h, &t.Volume24h)
		tickers = append(tickers, t)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tickers)
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		return
	}
	defer conn.Close()

	clientsMu.Lock()
	clients[conn] = make(map[string]bool)
	clientsMu.Unlock()

	defer func() {
		clientsMu.Lock()
		delete(clients, conn)
		clientsMu.Unlock()
	}()

	// Handle incoming messages (subscriptions)
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

		clientsMu.Lock()
		if msg.Method == "SUBSCRIBE" {
			for _, channel := range msg.Params {
				clients[conn][channel] = true
			}
		} else if msg.Method == "UNSUBSCRIBE" {
			for _, channel := range msg.Params {
				delete(clients[conn], channel)
			}
		}
		clientsMu.Unlock()
	}
}

func subscribeToUpdates() {
	ctx := context.Background()
	pubsub := redisClient.Subscribe(ctx, "market:ticker", "market:trade", "market:kline")
	defer pubsub.Close()

	for msg := range pubsub.Channel() {
		broadcastToClients(msg.Channel, []byte(msg.Payload))
	}
}

func broadcastToClients(channel string, data []byte) {
	clientsMu.RLock()
	defer clientsMu.RUnlock()

	for conn, subs := range clients {
		if subs[channel] {
			conn.WriteMessage(websocket.TextMessage, data)
		}
	}
}

func generateMockPrices() {
	ctx := context.Background()
	symbols := []string{"BTC_USDM_PERP", "ETH_USDM_PERP", "SOL_USDM_PERP"}
	basePrices := map[string]float64{
		"BTC_USDM_PERP": 97000,
		"ETH_USDM_PERP": 3400,
		"SOL_USDM_PERP": 180,
	}

	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		for _, symbol := range symbols {
			// Random price movement
			basePrice := basePrices[symbol]
			change := (float64(time.Now().UnixNano()%1000) - 500) / 10000
			newPrice := basePrice * (1 + change)
			basePrices[symbol] = newPrice

			ticker := Ticker{
				Symbol:             symbol,
				LastPrice:          newPrice,
				PriceChangePercent: change * 100,
				MarkPrice:          newPrice * 0.9999,
				High24h:            newPrice * 1.02,
				Low24h:             newPrice * 0.98,
			}

			// Update Redis cache
			data, _ := json.Marshal(ticker)
			redisClient.Set(ctx, "ticker:"+symbol, data, 2*time.Second)

			// Publish to subscribers
			wsData, _ := json.Marshal(map[string]interface{}{
				"type": "ticker",
				"data": ticker,
			})
			redisClient.Publish(ctx, "market:ticker", wsData)
		}
	}
}

func getEnv(key, defaultValue string) string {
	if value, exists := lookupEnv(key); exists {
		return value
	}
	return defaultValue
}

func lookupEnv(key string) (string, bool) {
	// Simple implementation
	return "", false
}

