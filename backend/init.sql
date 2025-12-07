-- HydroX Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Balances table
CREATE TABLE IF NOT EXISTS balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    asset VARCHAR(50) NOT NULL,
    available DECIMAL(36, 18) DEFAULT 0,
    locked DECIMAL(36, 18) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, asset)
);

-- Positions table
CREATE TABLE IF NOT EXISTS positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(50) NOT NULL,
    side VARCHAR(10) NOT NULL, -- 'Long' or 'Short'
    size DECIMAL(36, 18) NOT NULL,
    entry_price DECIMAL(36, 18) NOT NULL,
    leverage INTEGER NOT NULL DEFAULT 1,
    liquidation_price DECIMAL(36, 18),
    margin DECIMAL(36, 18) NOT NULL,
    unrealized_pnl DECIMAL(36, 18) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(50) NOT NULL,
    side VARCHAR(10) NOT NULL, -- 'Buy' or 'Sell'
    type VARCHAR(20) NOT NULL, -- 'Market', 'Limit', 'StopLimit'
    price DECIMAL(36, 18),
    amount DECIMAL(36, 18) NOT NULL,
    filled DECIMAL(36, 18) DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'Open', -- 'Open', 'Filled', 'PartiallyFilled', 'Cancelled'
    time_in_force VARCHAR(10) DEFAULT 'GTC', -- 'GTC', 'IOC', 'FOK'
    reduce_only BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order History table
CREATE TABLE IF NOT EXISTS order_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(50) NOT NULL,
    side VARCHAR(10) NOT NULL,
    type VARCHAR(20) NOT NULL,
    price DECIMAL(36, 18),
    amount DECIMAL(36, 18) NOT NULL,
    filled DECIMAL(36, 18) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    closed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trades table (for trade history display)
CREATE TABLE IF NOT EXISTS trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol VARCHAR(50) NOT NULL,
    price DECIMAL(36, 18) NOT NULL,
    amount DECIMAL(36, 18) NOT NULL,
    side VARCHAR(10) NOT NULL, -- 'Buy' or 'Sell'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vaults table
CREATE TABLE IF NOT EXISTS vaults (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) UNIQUE NOT NULL,
    tvl DECIMAL(36, 18) DEFAULT 0,
    apy DECIMAL(10, 4) DEFAULT 0,
    capacity DECIMAL(36, 18) NOT NULL,
    min_deposit DECIMAL(36, 18) DEFAULT 0,
    lock_period_days INTEGER DEFAULT 7,
    management_fee DECIMAL(10, 4) DEFAULT 0,
    performance_fee DECIMAL(10, 4) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vault Deposits table
CREATE TABLE IF NOT EXISTS vault_deposits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vault_id UUID REFERENCES vaults(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(36, 18) NOT NULL,
    shares DECIMAL(36, 18) NOT NULL,
    deposited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vault Transactions table
CREATE TABLE IF NOT EXISTS vault_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vault_id UUID REFERENCES vaults(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- 'Deposit' or 'Withdrawal'
    amount DECIMAL(36, 18) NOT NULL,
    status VARCHAR(20) DEFAULT 'Completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vault Performance table (for charts)
CREATE TABLE IF NOT EXISTS vault_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vault_id UUID REFERENCES vaults(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    value DECIMAL(36, 18) NOT NULL,
    UNIQUE(vault_id, date)
);

-- Market Ticker cache table (backup for Redis)
CREATE TABLE IF NOT EXISTS market_tickers (
    symbol VARCHAR(50) PRIMARY KEY,
    last_price DECIMAL(36, 18) NOT NULL,
    price_change DECIMAL(36, 18) DEFAULT 0,
    price_change_percent DECIMAL(10, 4) DEFAULT 0,
    high_24h DECIMAL(36, 18),
    low_24h DECIMAL(36, 18),
    volume_24h DECIMAL(36, 18) DEFAULT 0,
    quote_volume_24h DECIMAL(36, 18) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Klines table (OHLCV data)
CREATE TABLE IF NOT EXISTS klines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol VARCHAR(50) NOT NULL,
    interval VARCHAR(10) NOT NULL, -- '1m', '5m', '15m', '1h', '4h', '1d'
    open_time TIMESTAMP WITH TIME ZONE NOT NULL,
    open DECIMAL(36, 18) NOT NULL,
    high DECIMAL(36, 18) NOT NULL,
    low DECIMAL(36, 18) NOT NULL,
    close DECIMAL(36, 18) NOT NULL,
    volume DECIMAL(36, 18) DEFAULT 0,
    UNIQUE(symbol, interval, open_time)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_positions_user ON positions(user_id);
CREATE INDEX IF NOT EXISTS idx_positions_symbol ON positions(symbol);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_symbol ON orders(symbol);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol);
CREATE INDEX IF NOT EXISTS idx_trades_created ON trades(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_klines_symbol_interval ON klines(symbol, interval, open_time DESC);
CREATE INDEX IF NOT EXISTS idx_vault_deposits_user ON vault_deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_vault_transactions_vault ON vault_transactions(vault_id);

-- Insert sample vault
INSERT INTO vaults (name, address, tvl, apy, capacity, min_deposit, lock_period_days)
VALUES (
    'HydroX Liquidity Provider',
    'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq2ytjqp',
    0,
    0,
    5000000,
    100,
    7
) ON CONFLICT DO NOTHING;

-- Insert supported markets
INSERT INTO market_tickers (symbol, last_price, high_24h, low_24h)
VALUES 
    ('BTC_USDM_PERP', 97000, 98000, 95000),
    ('ETH_USDM_PERP', 3400, 3500, 3300),
    ('SOL_USDM_PERP', 180, 190, 170)
ON CONFLICT DO NOTHING;

