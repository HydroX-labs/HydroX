package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

var (
	db          *pgxpool.Pool
	redisClient *redis.Client
)

type User struct {
	ID            string    `json:"id"`
	WalletAddress string    `json:"wallet_address"`
	CreatedAt     time.Time `json:"created_at"`
}

type ConnectRequest struct {
	WalletAddress string `json:"wallet_address"`
}

type Balance struct {
	Asset     string  `json:"asset"`
	Available float64 `json:"available"`
	Locked    float64 `json:"locked"`
	Total     float64 `json:"total"`
}

func main() {
	var err error
	dbURL := getEnv("DATABASE_URL", "postgres://hydrox:hydrox_secret@localhost:5432/hydrox?sslmode=disable")
	db, err = pgxpool.New(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v", err)
	}
	defer db.Close()

	redisURL := getEnv("REDIS_URL", "localhost:6379")
	redisClient = redis.NewClient(&redis.Options{
		Addr:     redisURL,
		PoolSize: 100,
	})
	defer redisClient.Close()

	r := mux.NewRouter()

	r.HandleFunc("/health", healthHandler).Methods("GET")
	r.HandleFunc("/api/v1/auth/connect", connectHandler).Methods("POST")
	r.HandleFunc("/api/v1/auth/disconnect", disconnectHandler).Methods("POST")
	r.HandleFunc("/api/v1/users/profile", getProfileHandler).Methods("GET")
	r.HandleFunc("/api/v1/users/balances", getBalancesHandler).Methods("GET")
	r.HandleFunc("/api/v1/users/{wallet}", getUserByWalletHandler).Methods("GET")

	handler := corsMiddleware(r)

	port := getEnv("PORT", "8084")
	log.Printf("User service starting on port %s", port)
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
	json.NewEncoder(w).Encode(map[string]string{"status": "healthy"})
}

func getUserID(r *http.Request) string {
	userID := r.Header.Get("X-User-ID")
	if userID == "" {
		userID = r.URL.Query().Get("user_id")
	}
	return userID
}

func connectHandler(w http.ResponseWriter, r *http.Request) {
	var req ConnectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if req.WalletAddress == "" {
		http.Error(w, "Wallet address required", http.StatusBadRequest)
		return
	}

	ctx := r.Context()

	// Check if user exists
	var userID string
	err := db.QueryRow(ctx, `
		SELECT id FROM users WHERE wallet_address = $1
	`, req.WalletAddress).Scan(&userID)

	if err != nil {
		// Create new user
		userID = uuid.New().String()
		_, err = db.Exec(ctx, `
			INSERT INTO users (id, wallet_address) VALUES ($1, $2)
		`, userID, req.WalletAddress)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Create default USDM balance
		_, err = db.Exec(ctx, `
			INSERT INTO balances (user_id, asset, available, locked) 
			VALUES ($1, 'USDM', 10000, 0)
		`, userID)
		if err != nil {
			log.Printf("Failed to create default balance: %v", err)
		}
	}

	// Store session in Redis (24 hour expiry)
	sessionKey := "session:" + userID
	redisClient.Set(ctx, sessionKey, req.WalletAddress, 24*time.Hour)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"user_id":        userID,
		"wallet_address": req.WalletAddress,
		"status":         "connected",
	})
}

func disconnectHandler(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID != "" {
		ctx := r.Context()
		redisClient.Del(ctx, "session:"+userID)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "disconnected"})
}

func getProfileHandler(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	ctx := r.Context()
	var user User

	err := db.QueryRow(ctx, `
		SELECT id, wallet_address, created_at FROM users WHERE id = $1
	`, userID).Scan(&user.ID, &user.WalletAddress, &user.CreatedAt)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func getBalancesHandler(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode([]Balance{})
		return
	}

	ctx := r.Context()

	// Try cache first
	cacheKey := "balances:" + userID
	cached, err := redisClient.Get(ctx, cacheKey).Result()
	if err == nil {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(cached))
		return
	}

	rows, err := db.Query(ctx, `
		SELECT asset, available, locked FROM balances WHERE user_id = $1
	`, userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var balances []Balance
	for rows.Next() {
		var b Balance
		rows.Scan(&b.Asset, &b.Available, &b.Locked)
		b.Total = b.Available + b.Locked
		balances = append(balances, b)
	}

	if balances == nil {
		balances = []Balance{}
	}

	// Cache for 5 seconds
	data, _ := json.Marshal(balances)
	redisClient.Set(ctx, cacheKey, data, 5*time.Second)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(balances)
}

func getUserByWalletHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	wallet := vars["wallet"]

	ctx := r.Context()
	var user User

	err := db.QueryRow(ctx, `
		SELECT id, wallet_address, created_at FROM users WHERE wallet_address = $1
	`, wallet).Scan(&user.ID, &user.WalletAddress, &user.CreatedAt)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

