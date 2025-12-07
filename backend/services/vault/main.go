package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

var (
	db          *pgxpool.Pool
	redisClient *redis.Client
)

type Vault struct {
	ID             string  `json:"id"`
	Name           string  `json:"name"`
	Address        string  `json:"address"`
	TVL            float64 `json:"tvl"`
	APY            float64 `json:"apy"`
	Capacity       float64 `json:"capacity"`
	MinDeposit     float64 `json:"min_deposit"`
	LockPeriodDays int     `json:"lock_period_days"`
	ManagementFee  float64 `json:"management_fee"`
	PerformanceFee float64 `json:"performance_fee"`
	Status         string  `json:"status"`
	Depositors     int     `json:"depositors"`
	DailyChange    float64 `json:"daily_change"`
	WeeklyChange   float64 `json:"weekly_change"`
	MonthlyChange  float64 `json:"monthly_change"`
}

type VaultPerformance struct {
	Date  string  `json:"date"`
	Value float64 `json:"value"`
}

type VaultTransaction struct {
	ID        string    `json:"id"`
	Type      string    `json:"type"`
	Amount    float64   `json:"amount"`
	Address   string    `json:"address"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}

type DepositRequest struct {
	Amount float64 `json:"amount"`
}

type UserVaultInfo struct {
	Balance float64 `json:"balance"`
	Shares  float64 `json:"shares"`
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
	r.HandleFunc("/api/v1/vaults", getVaultsHandler).Methods("GET")
	r.HandleFunc("/api/v1/vaults/{id}", getVaultHandler).Methods("GET")
	r.HandleFunc("/api/v1/vaults/{id}/performance", getVaultPerformanceHandler).Methods("GET")
	r.HandleFunc("/api/v1/vaults/{id}/transactions", getVaultTransactionsHandler).Methods("GET")
	r.HandleFunc("/api/v1/vaults/{id}/deposit", depositHandler).Methods("POST")
	r.HandleFunc("/api/v1/vaults/{id}/withdraw", withdrawHandler).Methods("POST")
	r.HandleFunc("/api/v1/vaults/{id}/user", getUserVaultInfoHandler).Methods("GET")

	handler := corsMiddleware(r)

	port := getEnv("PORT", "8083")
	log.Printf("Vault service starting on port %s", port)
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

func getVaultsHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	rows, err := db.Query(ctx, `
		SELECT v.id, v.name, v.address, v.tvl, v.apy, v.capacity, 
		       v.min_deposit, v.lock_period_days, v.management_fee, 
		       v.performance_fee, v.status,
		       (SELECT COUNT(DISTINCT user_id) FROM vault_deposits WHERE vault_id = v.id) as depositors
		FROM vaults v
		WHERE v.status = 'Active'
	`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var vaults []Vault
	for rows.Next() {
		var v Vault
		rows.Scan(&v.ID, &v.Name, &v.Address, &v.TVL, &v.APY, &v.Capacity,
			&v.MinDeposit, &v.LockPeriodDays, &v.ManagementFee,
			&v.PerformanceFee, &v.Status, &v.Depositors)
		vaults = append(vaults, v)
	}

	if vaults == nil {
		vaults = []Vault{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(vaults)
}

func getVaultHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	vaultID := vars["id"]
	ctx := r.Context()

	// Try cache first
	cacheKey := "vault:" + vaultID
	cached, err := redisClient.Get(ctx, cacheKey).Result()
	if err == nil {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(cached))
		return
	}

	var v Vault
	err = db.QueryRow(ctx, `
		SELECT v.id, v.name, v.address, v.tvl, v.apy, v.capacity, 
		       v.min_deposit, v.lock_period_days, v.management_fee, 
		       v.performance_fee, v.status,
		       (SELECT COUNT(DISTINCT user_id) FROM vault_deposits WHERE vault_id = v.id) as depositors
		FROM vaults v
		WHERE v.id = $1
	`, vaultID).Scan(&v.ID, &v.Name, &v.Address, &v.TVL, &v.APY, &v.Capacity,
		&v.MinDeposit, &v.LockPeriodDays, &v.ManagementFee,
		&v.PerformanceFee, &v.Status, &v.Depositors)
	if err != nil {
		http.Error(w, "Vault not found", http.StatusNotFound)
		return
	}

	// Cache for 10 seconds
	data, _ := json.Marshal(v)
	redisClient.Set(ctx, cacheKey, data, 10*time.Second)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(v)
}

func getVaultPerformanceHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	vaultID := vars["id"]
	ctx := r.Context()

	rows, err := db.Query(ctx, `
		SELECT date, value
		FROM vault_performance
		WHERE vault_id = $1
		ORDER BY date ASC
		LIMIT 365
	`, vaultID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var performance []VaultPerformance
	for rows.Next() {
		var p VaultPerformance
		var date time.Time
		rows.Scan(&date, &p.Value)
		p.Date = date.Format("2006-01-02")
		performance = append(performance, p)
	}

	if performance == nil {
		performance = []VaultPerformance{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(performance)
}

func getVaultTransactionsHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	vaultID := vars["id"]
	userID := getUserID(r)
	ctx := r.Context()

	query := `
		SELECT vt.id, vt.type, vt.amount, u.wallet_address, vt.status, vt.created_at
		FROM vault_transactions vt
		JOIN users u ON vt.user_id = u.id
		WHERE vt.vault_id = $1
	`
	args := []interface{}{vaultID}

	if userID != "" {
		query += " AND vt.user_id = $2"
		args = append(args, userID)
	}

	query += " ORDER BY vt.created_at DESC LIMIT 50"

	rows, err := db.Query(ctx, query, args...)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var transactions []VaultTransaction
	for rows.Next() {
		var t VaultTransaction
		rows.Scan(&t.ID, &t.Type, &t.Amount, &t.Address, &t.Status, &t.CreatedAt)
		transactions = append(transactions, t)
	}

	if transactions == nil {
		transactions = []VaultTransaction{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(transactions)
}

func depositHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	vaultID := vars["id"]
	userID := getUserID(r)

	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req DepositRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	ctx := r.Context()

	// Start transaction
	tx, err := db.Begin(ctx)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer tx.Rollback(ctx)

	// Record deposit
	_, err = tx.Exec(ctx, `
		INSERT INTO vault_deposits (vault_id, user_id, amount, shares)
		VALUES ($1, $2, $3, $3)
	`, vaultID, userID, req.Amount)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Record transaction
	_, err = tx.Exec(ctx, `
		INSERT INTO vault_transactions (vault_id, user_id, type, amount)
		VALUES ($1, $2, 'Deposit', $3)
	`, vaultID, userID, req.Amount)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Update vault TVL
	_, err = tx.Exec(ctx, `
		UPDATE vaults SET tvl = tvl + $1, updated_at = NOW() WHERE id = $2
	`, req.Amount, vaultID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := tx.Commit(ctx); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Invalidate cache
	redisClient.Del(ctx, "vault:"+vaultID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}

func withdrawHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	vaultID := vars["id"]
	userID := getUserID(r)

	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req DepositRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	ctx := r.Context()

	tx, err := db.Begin(ctx)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer tx.Rollback(ctx)

	// Update user deposit
	_, err = tx.Exec(ctx, `
		UPDATE vault_deposits 
		SET amount = amount - $1, shares = shares - $1
		WHERE vault_id = $2 AND user_id = $3
	`, req.Amount, vaultID, userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Record transaction
	_, err = tx.Exec(ctx, `
		INSERT INTO vault_transactions (vault_id, user_id, type, amount)
		VALUES ($1, $2, 'Withdrawal', $3)
	`, vaultID, userID, req.Amount)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Update vault TVL
	_, err = tx.Exec(ctx, `
		UPDATE vaults SET tvl = tvl - $1, updated_at = NOW() WHERE id = $2
	`, req.Amount, vaultID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := tx.Commit(ctx); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	redisClient.Del(ctx, "vault:"+vaultID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}

func getUserVaultInfoHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	vaultID := vars["id"]
	userID := getUserID(r)

	if userID == "" {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(UserVaultInfo{Balance: 0, Shares: 0})
		return
	}

	ctx := r.Context()
	var info UserVaultInfo

	err := db.QueryRow(ctx, `
		SELECT COALESCE(SUM(amount), 0), COALESCE(SUM(shares), 0)
		FROM vault_deposits
		WHERE vault_id = $1 AND user_id = $2
	`, vaultID, userID).Scan(&info.Balance, &info.Shares)
	if err != nil {
		info = UserVaultInfo{Balance: 0, Shares: 0}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(info)
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

