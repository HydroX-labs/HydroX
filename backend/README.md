# HydroX Backend

Go 기반 MSA 백엔드 서비스입니다. 저지연 처리를 위해 WebSocket과 Redis를 활용합니다.

## 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway (:8080)                       │
│                 (Reverse Proxy + WebSocket)                  │
└──────────────┬──────────────┬──────────────┬───────────────┘
               │              │              │
    ┌──────────▼──────┐ ┌─────▼─────┐ ┌─────▼──────┐
    │  Market (:8081) │ │  Trading  │ │   Vault    │
    │  - Ticker       │ │  (:8082)  │ │  (:8083)   │
    │  - Klines       │ │  - Orders │ │  - Deposit │
    │  - Trades       │ │  - Pos.   │ │  - Withdraw│
    │  - WebSocket    │ │  - Balance│ │  - Perform │
    └────────┬────────┘ └─────┬─────┘ └─────┬──────┘
             │                │              │
             └────────────────┼──────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
        ┌─────▼─────┐   ┌─────▼─────┐   ┌─────▼─────┐
        │  Redis    │   │ PostgreSQL│   │   User    │
        │  (:6379)  │   │  (:5432)  │   │  (:8084)  │
        └───────────┘   └───────────┘   └───────────┘
```

## 서비스 목록

| 서비스 | 포트 | 설명 |
|--------|------|------|
| Gateway | 8080 | API Gateway, WebSocket 프록시 |
| Market | 8081 | 시세 데이터, 실시간 가격 |
| Trading | 8082 | 주문, 포지션, 잔고 |
| Vault | 8083 | Vault 예치/출금 |
| User | 8084 | 사용자 인증, 지갑 연결 |
| PostgreSQL | 5432 | 메인 데이터베이스 |
| Redis | 6379 | 캐시, Pub/Sub |

## 빠른 시작

### 요구사항
- Docker & Docker Compose
- (개발용) Go 1.22+

### 실행

```bash
cd backend
docker-compose up --build
```

모든 서비스가 시작되면:
- API Gateway: http://localhost:8080
- Health Check: http://localhost:8080/health

### 개발 모드

개별 서비스 실행:

```bash
# 인프라만 먼저 시작
docker-compose up postgres redis

# 개별 서비스 실행
cd services/market && go run main.go
cd services/trading && go run main.go
cd services/vault && go run main.go
cd services/user && go run main.go
cd services/gateway && go run main.go
```

## API 엔드포인트

### Market Service
```
GET  /api/v1/markets                    # 전체 마켓 목록
GET  /api/v1/markets/{symbol}/ticker    # 시세 정보
GET  /api/v1/markets/{symbol}/klines    # 캔들스틱 차트 데이터
GET  /api/v1/markets/{symbol}/trades    # 최근 체결 내역
WS   /ws                                # 실시간 스트리밍
```

### Trading Service
```
GET    /api/v1/positions                # 포지션 조회
POST   /api/v1/positions/{id}/close     # 포지션 청산
GET    /api/v1/orders                   # 오픈 오더 조회
POST   /api/v1/orders                   # 주문 생성
DELETE /api/v1/orders/{id}              # 주문 취소
GET    /api/v1/orders/history           # 주문 내역
GET    /api/v1/balances                 # 잔고 조회
```

### Vault Service
```
GET  /api/v1/vaults                     # Vault 목록
GET  /api/v1/vaults/{id}                # Vault 상세
GET  /api/v1/vaults/{id}/performance    # 수익률 차트
GET  /api/v1/vaults/{id}/transactions   # 입출금 내역
POST /api/v1/vaults/{id}/deposit        # 예치
POST /api/v1/vaults/{id}/withdraw       # 출금
GET  /api/v1/vaults/{id}/user           # 사용자 Vault 정보
```

### User Service
```
POST /api/v1/auth/connect               # 지갑 연결
POST /api/v1/auth/disconnect            # 연결 해제
GET  /api/v1/users/profile              # 프로필 조회
GET  /api/v1/users/balances             # 잔고 조회
```

## WebSocket

### 연결
```javascript
const ws = new WebSocket('ws://localhost:8080/ws');
```

### 구독
```javascript
// 티커 구독
ws.send(JSON.stringify({
  method: 'SUBSCRIBE',
  params: ['ticker.BTC_USDM_PERP']
}));

// 거래 내역 구독
ws.send(JSON.stringify({
  method: 'SUBSCRIBE',
  params: ['trade.BTC_USDM_PERP']
}));
```

### 메시지 형식
```javascript
// 티커 업데이트
{
  "type": "ticker",
  "data": {
    "symbol": "BTC_USDM_PERP",
    "last_price": 97250.50,
    "price_change_percent": 2.35,
    "mark_price": 97248.00
  }
}
```

## 인증

모든 사용자 관련 API는 `X-User-ID` 헤더가 필요합니다:

```bash
curl -H "X-User-ID: user-uuid-here" http://localhost:8080/api/v1/positions
```

## 환경 변수

| 변수 | 기본값 | 설명 |
|------|--------|------|
| PORT | 8080 | 서비스 포트 |
| DATABASE_URL | postgres://... | PostgreSQL 연결 문자열 |
| REDIS_URL | localhost:6379 | Redis 주소 |
| MARKET_SERVICE_URL | http://localhost:8081 | Market 서비스 URL |
| TRADING_SERVICE_URL | http://localhost:8082 | Trading 서비스 URL |
| VAULT_SERVICE_URL | http://localhost:8083 | Vault 서비스 URL |
| USER_SERVICE_URL | http://localhost:8084 | User 서비스 URL |

## 성능 최적화

### Redis 캐싱
- Ticker 데이터: 1초 TTL
- Klines 데이터: 5초 TTL
- 사용자 잔고: 5초 TTL

### 커넥션 풀
- PostgreSQL: 최대 50개 커넥션
- Redis: 최대 100개 커넥션

### WebSocket
- 실시간 가격 업데이트: 1초 간격
- Redis Pub/Sub를 통한 브로드캐스트

## 종료

```bash
docker-compose down

# 데이터 볼륨도 삭제
docker-compose down -v
```

