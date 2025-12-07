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

type Position struct {
	ID               string  `json:"id"`
	UserID           string  `json:"user_id"`
	Symbol           string  `json:"symbol"`
	Side             string  `json:"side"`
	Size             float64 `json:"size"`
	EntryPrice       float64 `json:"entry_price"`
	MarkPrice        float64 `json:"mark_price"`
	Leverage         int     `json:"leverage"`
	LiquidationPrice float64 `json:"liquidation_price"`
	Margin           float64 `json:"margin"`
	UnrealizedPnL    float64 `json:"unrealized_pnl"`
	PnLPercent       float64 `json:"pnl_percent"`
}

type Order struct {
	ID          string  `json:"id"`
	UserID      string  `json:"user_id"`
	Symbol      string  `json:"symbol"`
	Side        string  `json:"side"`
	Type        string  `json:"type"`
	Price       float64 `json:"price"`
	Amount      float64 `json:"amount"`
	Filled      float64 `json:"filled"`
	Status      string  `json:"status"`
	TimeInForce string  `json:"time_in_force"`
	ReduceOnly  bool    `json:"reduce_only"`
	CreatedAt   string  `json:"created_at"`
}

type CreateOrderRequest struct {
	Symbol      string  `json:"symbol"`
	Side        string  `json:"side"`
	Type        string  `json:"type"`
	Price       float64 `json:"price,omitempty"`
	Amount      float64 `json:"amount"`
	Leverage    int     `json:"leverage"`
	TimeInForce string  `json:"time_in_force"`
	ReduceOnly  bool    `json:"reduce_only"`
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

	// Health check
	r.HandleFunc("/health", healthHandler).Methods("GET")

	// Positions
	r.HandleFunc("/api/v1/positions", getPositionsHandler).Methods("GET")
	r.HandleFunc("/api/v1/positions/{id}/close", closePositionHandler).Methods("POST")

	// Orders
	r.HandleFunc("/api/v1/orders", getOrdersHandler).Methods("GET")
	r.HandleFunc("/api/v1/orders", createOrderHandler).Methods("POST")
	r.HandleFunc("/api/v1/orders/{id}", cancelOrderHandler).Methods("DELETE")
	r.HandleFunc("/api/v1/orders/history", getOrderHistoryHandler).Methods("GET")

	// Balances
	r.HandleFunc("/api/v1/balances", getBalancesHandler).Methods("GET")

	handler := corsMiddleware(r)

	port := getEnv("PORT", "8082")
	log.Printf("Trading service starting on port %s", port)
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

func getPositionsHandler(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode([]Position{})
		return
	}

	ctx := r.Context()
	rows, err := db.Query(ctx, `
		SELECT id, user_id, symbol, side, size, entry_price, leverage, 
		       liquidation_price, margin, unrealized_pnl
		FROM positions 
		WHERE user_id = $1
	`, userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var positions []Position
	for rows.Next() {
		var p Position
		rows.Scan(&p.ID, &p.UserID, &p.Symbol, &p.Side, &p.Size,
			&p.EntryPrice, &p.Leverage, &p.LiquidationPrice, &p.Margin, &p.UnrealizedPnL)
		
		// Calculate mark price and PnL (simplified)
		p.MarkPrice = p.EntryPrice * 1.001
		p.PnLPercent = (p.UnrealizedPnL / p.Margin) * 100
		positions = append(positions, p)
	}

	if positions == nil {
		positions = []Position{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(positions)
}

func closePositionHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	positionID := vars["id"]
	userID := getUserID(r)

	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	ctx := r.Context()
	_, err := db.Exec(ctx, `DELETE FROM positions WHERE id = $1 AND user_id = $2`, positionID, userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "closed"})
}

func getOrdersHandler(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode([]Order{})
		return
	}

	ctx := r.Context()
	rows, err := db.Query(ctx, `
		SELECT id, user_id, symbol, side, type, price, amount, filled, 
		       status, time_in_force, reduce_only, created_at
		FROM orders 
		WHERE user_id = $1 AND status = 'Open'
		ORDER BY created_at DESC
	`, userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var orders []Order
	for rows.Next() {
		var o Order
		var createdAt time.Time
		rows.Scan(&o.ID, &o.UserID, &o.Symbol, &o.Side, &o.Type, &o.Price,
			&o.Amount, &o.Filled, &o.Status, &o.TimeInForce, &o.ReduceOnly, &createdAt)
		o.CreatedAt = createdAt.Format("2006-01-02 15:04:05")
		orders = append(orders, o)
	}

	if orders == nil {
		orders = []Order{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(orders)
}

func createOrderHandler(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req CreateOrderRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	ctx := r.Context()
	orderID := uuid.New().String()

	_, err := db.Exec(ctx, `
		INSERT INTO orders (id, user_id, symbol, side, type, price, amount, status, time_in_force, reduce_only)
		VALUES ($1, $2, $3, $4, $5, $6, $7, 'Open', $8, $9)
	`, orderID, userID, req.Symbol, req.Side, req.Type, req.Price, req.Amount, req.TimeInForce, req.ReduceOnly)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Publish order event to Redis
	redisClient.Publish(ctx, "trading:order", map[string]interface{}{
		"order_id": orderID,
		"user_id":  userID,
		"symbol":   req.Symbol,
		"side":     req.Side,
		"type":     req.Type,
		"amount":   req.Amount,
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"id":     orderID,
		"status": "Open",
	})
}

func cancelOrderHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	orderID := vars["id"]
	userID := getUserID(r)

	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	ctx := r.Context()
	_, err := db.Exec(ctx, `
		UPDATE orders SET status = 'Cancelled', updated_at = NOW() 
		WHERE id = $1 AND user_id = $2 AND status = 'Open'
	`, orderID, userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "cancelled"})
}

func getOrderHistoryHandler(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode([]Order{})
		return
	}

	ctx := r.Context()
	rows, err := db.Query(ctx, `
		SELECT id, user_id, symbol, side, type, price, amount, filled, 
		       status, time_in_force, reduce_only, created_at
		FROM orders 
		WHERE user_id = $1 AND status != 'Open'
		ORDER BY created_at DESC
		LIMIT 50
	`, userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var orders []Order
	for rows.Next() {
		var o Order
		var createdAt time.Time
		rows.Scan(&o.ID, &o.UserID, &o.Symbol, &o.Side, &o.Type, &o.Price,
			&o.Amount, &o.Filled, &o.Status, &o.TimeInForce, &o.ReduceOnly, &createdAt)
		o.CreatedAt = createdAt.Format("2006-01-02 15:04:05")
		orders = append(orders, o)
	}

	if orders == nil {
		orders = []Order{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(orders)
}

func getBalancesHandler(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	if userID == "" {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode([]Balance{})
		return
	}

	ctx := r.Context()
	rows, err := db.Query(ctx, `
		SELECT asset, available, locked
		FROM balances 
		WHERE user_id = $1
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

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(balances)
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

