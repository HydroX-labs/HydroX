// API Gateway endpoint
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';

// Types
export interface Ticker {
  symbol: string;
  last_price: number;
  price_change: number;
  price_change_percent: number;
  high_24h: number;
  low_24h: number;
  volume_24h: number;
  quote_volume_24h: number;
  mark_price: number;
}

export interface Kline {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Trade {
  price: number;
  amount: number;
  side: string;
  time: number;
}

export interface Position {
  id: string;
  user_id: string;
  symbol: string;
  side: string;
  size: number;
  entry_price: number;
  mark_price: number;
  leverage: number;
  liquidation_price: number;
  margin: number;
  unrealized_pnl: number;
  pnl_percent: number;
}

export interface Order {
  id: string;
  user_id: string;
  symbol: string;
  side: string;
  type: string;
  price: number;
  amount: number;
  filled: number;
  status: string;
  time_in_force: string;
  reduce_only: boolean;
  created_at: string;
}

export interface Balance {
  asset: string;
  available: number;
  locked: number;
  total: number;
}

export interface Vault {
  id: string;
  name: string;
  address: string;
  tvl: number;
  apy: number;
  capacity: number;
  min_deposit: number;
  lock_period_days: number;
  management_fee: number;
  performance_fee: number;
  status: string;
  depositors: number;
  daily_change: number;
  weekly_change: number;
  monthly_change: number;
}

export interface VaultPerformance {
  date: string;
  value: number;
}

export interface VaultTransaction {
  id: string;
  type: string;
  amount: number;
  address: string;
  status: string;
  created_at: string;
}

export interface UserVaultInfo {
  balance: number;
  shares: number;
}

export interface User {
  id: string;
  wallet_address: string;
  created_at: string;
}

// Helper function for API calls
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add user ID if available
  if (typeof window !== 'undefined') {
    const userId = localStorage.getItem('hydrox_user_id');
    if (userId) {
      (defaultHeaders as Record<string, string>)['X-User-ID'] = userId;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

// Market API
export const marketApi = {
  getAllMarkets: () => fetchAPI<Ticker[]>('/api/v1/markets'),
  
  getTicker: (symbol: string) => 
    fetchAPI<Ticker>(`/api/v1/markets/${symbol}/ticker`),
  
  getKlines: (symbol: string, interval: string = '1h') =>
    fetchAPI<Kline[]>(`/api/v1/markets/${symbol}/klines?interval=${interval}`),
  
  getTrades: (symbol: string) =>
    fetchAPI<Trade[]>(`/api/v1/markets/${symbol}/trades`),
};

// Trading API
export const tradingApi = {
  getPositions: () => fetchAPI<Position[]>('/api/v1/positions'),
  
  closePosition: (positionId: string) =>
    fetchAPI<{ status: string }>(`/api/v1/positions/${positionId}/close`, {
      method: 'POST',
    }),
  
  getOrders: () => fetchAPI<Order[]>('/api/v1/orders'),
  
  createOrder: (order: {
    symbol: string;
    side: string;
    type: string;
    price?: number;
    amount: number;
    leverage: number;
    time_in_force: string;
    reduce_only: boolean;
  }) =>
    fetchAPI<{ id: string; status: string }>('/api/v1/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    }),
  
  cancelOrder: (orderId: string) =>
    fetchAPI<{ status: string }>(`/api/v1/orders/${orderId}`, {
      method: 'DELETE',
    }),
  
  getOrderHistory: () => fetchAPI<Order[]>('/api/v1/orders/history'),
  
  getBalances: () => fetchAPI<Balance[]>('/api/v1/balances'),
};

// Vault API
export const vaultApi = {
  getVaults: () => fetchAPI<Vault[]>('/api/v1/vaults'),
  
  getVault: (vaultId: string) => fetchAPI<Vault>(`/api/v1/vaults/${vaultId}`),
  
  getPerformance: (vaultId: string) =>
    fetchAPI<VaultPerformance[]>(`/api/v1/vaults/${vaultId}/performance`),
  
  getTransactions: (vaultId: string) =>
    fetchAPI<VaultTransaction[]>(`/api/v1/vaults/${vaultId}/transactions`),
  
  deposit: (vaultId: string, amount: number) =>
    fetchAPI<{ status: string }>(`/api/v1/vaults/${vaultId}/deposit`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),
  
  withdraw: (vaultId: string, amount: number) =>
    fetchAPI<{ status: string }>(`/api/v1/vaults/${vaultId}/withdraw`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),
  
  getUserInfo: (vaultId: string) =>
    fetchAPI<UserVaultInfo>(`/api/v1/vaults/${vaultId}/user`),
};

// User API
export const userApi = {
  connect: (walletAddress: string) =>
    fetchAPI<{ user_id: string; wallet_address: string; status: string }>(
      '/api/v1/auth/connect',
      {
        method: 'POST',
        body: JSON.stringify({ wallet_address: walletAddress }),
      }
    ),
  
  disconnect: () =>
    fetchAPI<{ status: string }>('/api/v1/auth/disconnect', {
      method: 'POST',
    }),
  
  getProfile: () => fetchAPI<User>('/api/v1/users/profile'),
  
  getBalances: () => fetchAPI<Balance[]>('/api/v1/users/balances'),
};

// WebSocket connection manager
export class WSClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();
  private subscriptions: Set<string> = new Set();

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(`${WS_BASE}/ws`);

    this.ws.onopen = () => {
      console.log('[WS] Connected');
      this.reconnectAttempts = 0;
      // Resubscribe to all channels
      this.subscriptions.forEach(channel => {
        this.send({ method: 'SUBSCRIBE', params: [channel] });
      });
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const channel = message.channel || message.type;
        
        if (channel && this.listeners.has(channel)) {
          this.listeners.get(channel)?.forEach(callback => {
            callback(message.data || message);
          });
        }
      } catch (e) {
        console.error('[WS] Parse error:', e);
      }
    };

    this.ws.onclose = () => {
      console.log('[WS] Disconnected');
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => this.connect(), 1000 * this.reconnectAttempts);
      }
    };

    this.ws.onerror = (error) => {
      console.error('[WS] Error:', error);
    };
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
    this.subscriptions.clear();
  }

  private send(data: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  subscribe(channel: string, callback: (data: unknown) => void) {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
    }
    this.listeners.get(channel)?.add(callback);
    
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.add(channel);
      this.send({ method: 'SUBSCRIBE', params: [channel] });
    }

    // Return unsubscribe function
    return () => {
      this.listeners.get(channel)?.delete(callback);
      if (this.listeners.get(channel)?.size === 0) {
        this.listeners.delete(channel);
        this.subscriptions.delete(channel);
        this.send({ method: 'UNSUBSCRIBE', params: [channel] });
      }
    };
  }
}

// Singleton WebSocket client
let wsClient: WSClient | null = null;

export function getWSClient(): WSClient {
  if (!wsClient) {
    wsClient = new WSClient();
  }
  return wsClient;
}

