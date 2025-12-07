package models

import (
	"time"
)

// User represents a user account
type User struct {
	ID            string    `json:"id"`
	WalletAddress string    `json:"wallet_address"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// Balance represents user's asset balance
type Balance struct {
	ID        string  `json:"id"`
	UserID    string  `json:"user_id"`
	Asset     string  `json:"asset"`
	Available float64 `json:"available,string"`
	Locked    float64 `json:"locked,string"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Position represents a trading position
type Position struct {
	ID               string    `json:"id"`
	UserID           string    `json:"user_id"`
	Symbol           string    `json:"symbol"`
	Side             string    `json:"side"` // "Long" or "Short"
	Size             float64   `json:"size,string"`
	EntryPrice       float64   `json:"entry_price,string"`
	MarkPrice        float64   `json:"mark_price,string"`
	Leverage         int       `json:"leverage"`
	LiquidationPrice float64   `json:"liquidation_price,string"`
	Margin           float64   `json:"margin,string"`
	UnrealizedPnL    float64   `json:"unrealized_pnl,string"`
	PnLPercent       float64   `json:"pnl_percent,string"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

// Order represents a trading order
type Order struct {
	ID          string    `json:"id"`
	UserID      string    `json:"user_id"`
	Symbol      string    `json:"symbol"`
	Side        string    `json:"side"` // "Buy" or "Sell"
	Type        string    `json:"type"` // "Market", "Limit", "StopLimit"
	Price       float64   `json:"price,string"`
	Amount      float64   `json:"amount,string"`
	Filled      float64   `json:"filled,string"`
	Status      string    `json:"status"` // "Open", "Filled", "PartiallyFilled", "Cancelled"
	TimeInForce string    `json:"time_in_force"`
	ReduceOnly  bool      `json:"reduce_only"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Trade represents a single trade execution
type Trade struct {
	ID        string    `json:"id"`
	Symbol    string    `json:"symbol"`
	Price     float64   `json:"price,string"`
	Amount    float64   `json:"amount,string"`
	Side      string    `json:"side"`
	CreatedAt time.Time `json:"created_at"`
}

// Ticker represents market ticker data
type Ticker struct {
	Symbol             string  `json:"symbol"`
	LastPrice          float64 `json:"last_price,string"`
	PriceChange        float64 `json:"price_change,string"`
	PriceChangePercent float64 `json:"price_change_percent,string"`
	High24h            float64 `json:"high_24h,string"`
	Low24h             float64 `json:"low_24h,string"`
	Volume24h          float64 `json:"volume_24h,string"`
	QuoteVolume24h     float64 `json:"quote_volume_24h,string"`
	MarkPrice          float64 `json:"mark_price,string"`
	UpdatedAt          time.Time `json:"updated_at"`
}

// Kline represents candlestick data
type Kline struct {
	Symbol   string    `json:"symbol"`
	Interval string    `json:"interval"`
	OpenTime time.Time `json:"open_time"`
	Open     float64   `json:"open,string"`
	High     float64   `json:"high,string"`
	Low      float64   `json:"low,string"`
	Close    float64   `json:"close,string"`
	Volume   float64   `json:"volume,string"`
}

// Vault represents a liquidity vault
type Vault struct {
	ID             string    `json:"id"`
	Name           string    `json:"name"`
	Address        string    `json:"address"`
	TVL            float64   `json:"tvl,string"`
	APY            float64   `json:"apy,string"`
	Capacity       float64   `json:"capacity,string"`
	MinDeposit     float64   `json:"min_deposit,string"`
	LockPeriodDays int       `json:"lock_period_days"`
	ManagementFee  float64   `json:"management_fee,string"`
	PerformanceFee float64   `json:"performance_fee,string"`
	Status         string    `json:"status"`
	Depositors     int       `json:"depositors"`
	DailyChange    float64   `json:"daily_change,string"`
	WeeklyChange   float64   `json:"weekly_change,string"`
	MonthlyChange  float64   `json:"monthly_change,string"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// VaultDeposit represents a user's deposit in a vault
type VaultDeposit struct {
	ID          string    `json:"id"`
	VaultID     string    `json:"vault_id"`
	UserID      string    `json:"user_id"`
	Amount      float64   `json:"amount,string"`
	Shares      float64   `json:"shares,string"`
	DepositedAt time.Time `json:"deposited_at"`
}

// VaultTransaction represents vault deposit/withdrawal transactions
type VaultTransaction struct {
	ID        string    `json:"id"`
	VaultID   string    `json:"vault_id"`
	UserID    string    `json:"user_id"`
	Type      string    `json:"type"` // "Deposit" or "Withdrawal"
	Amount    float64   `json:"amount,string"`
	Status    string    `json:"status"`
	Address   string    `json:"address"`
	CreatedAt time.Time `json:"created_at"`
}

// VaultPerformance represents daily vault performance data
type VaultPerformance struct {
	Date  string  `json:"date"`
	Value float64 `json:"value,string"`
}

// WebSocket message types
type WSMessage struct {
	Type    string      `json:"type"`
	Channel string      `json:"channel"`
	Data    interface{} `json:"data"`
}

type WSTickerData struct {
	Symbol             string  `json:"s"`
	LastPrice          float64 `json:"p,string"`
	PriceChangePercent float64 `json:"P,string"`
	MarkPrice          float64 `json:"m,string"`
}

type WSTradeData struct {
	Symbol string  `json:"s"`
	Price  float64 `json:"p,string"`
	Amount float64 `json:"q,string"`
	Side   string  `json:"S"`
	Time   int64   `json:"T"`
}

type WSKlineData struct {
	Symbol   string  `json:"s"`
	Interval string  `json:"i"`
	Time     int64   `json:"t"`
	Open     float64 `json:"o,string"`
	High     float64 `json:"h,string"`
	Low      float64 `json:"l,string"`
	Close    float64 `json:"c,string"`
	Volume   float64 `json:"v,string"`
}

