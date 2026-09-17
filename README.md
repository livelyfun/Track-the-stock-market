# 📈 StockMatrix — Multi-Market Real-Time Stock Dashboard

A full-stack, enterprise-grade stock tracking terminal with real-time WebSocket price updates, interactive charts, customizable price alerts, multi-currency conversion, multi-language internationalization (i18n), custom stock categorization, and dark/light themes.

---

## ✨ Features

- **🌐 Multi-Market Global Coverage**: Track equities and indexes across US (NASDAQ/NYSE), India (NSE/BSE), United Kingdom (LSE), Europe (Euronext), Japan (Tokyo), and Hong Kong (HKEX).
- **⏱️ Real-Time WebSocket Streaming**: Instant live price updates with animated upward/downward price flashes and low latency.
- **📊 Interactive Technical Charts**: High-resolution SVG candlestick & line charts with OHLC hover crosshairs, volume tracking, and multi-timeframe periods (`1D`, `5D`, `1M`, `6M`, `1Y`, `5Y`).
- **🚨 Intelligent Price Alerts**: Set real-time conditions (`ABOVE` / `BELOW` target price) with background evaluation and live browser toast notifications.
- **🏷️ Custom Stock Categories & Badges**: Create custom color-coded categories (e.g. *Long-term*, *High Growth*, *Dividends*) and filter your watchlists seamlessly.
- **💱 Multi-Currency Converter**: On-the-fly price conversion across USD ($), INR (₹), EUR (€), GBP (£), JPY (¥), CAD, AUD, and HKD with live cached forex exchange rates.
- **🌍 Multi-Language Internationalization**: Full localization support for English and Hindi (हिन्दी) with dynamic language switcher.
- **🌓 Dark & Light Mode System**: Custom HSL-tokenized sleek dark terminal and crisp light mode themes with system preference detection.
- **🎓 Interactive Onboarding Tour**: 5-step guided onboarding walkthrough for first-time traders with settings replay capability.
- **🟢 Real-Time Market Status**: Live Open / Closed market badges calculated using exact exchange trading hours and IANA timezones.

---

## 🛠️ Architecture & Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript & Vite
- **Styling**: Tailwind CSS & CSS Variables (HSL design token system)
- **State & Context**: React Context (`AuthContext`, `CurrencyContext`, `ThemeContext`)
- **Routing**: React Router v6 (with `ProtectedRoute` auth guard)
- **Internationalization**: `react-i18next` & `i18next`
- **Icons**: Lucide React
- **Web Server (Production)**: Nginx (Alpine) with SPA history fallback and gzip compression

### Backend
- **Framework**: FastAPI (Python 3.11) with ASGI Lifespan
- **Database ORM**: SQLAlchemy 2.0 with SQLite / PostgreSQL support
- **Authentication**: OAuth2 / JWT (JSON Web Tokens) with bcrypt password hashing
- **Data Engine**: Yahoo Finance API integration with in-memory TTL caching
- **Real-Time Engine**: WebSockets with per-user connection management & background broadcast loops

---

## 🚀 Quick Start with Docker (Recommended)

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/) installed.

### 1. Clone the Repository
```bash
git clone git@github.com:livelyfun/Track-the-stock-market.git
cd Track-the-stock-market
```

### 2. Configure Environment Variables
Copy the sample environment file:
```bash
cp .env.example .env
```

### 3. Start Production Containers
```bash
docker compose up --build -d
```

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Alternative ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### 4. Stop Containers
```bash
docker compose down
```

---

## 💻 Local Development Setup (Without Docker)

### Backend Setup
1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```
2. **Create and activate a Python virtual environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
4. **Copy environment variables**:
   ```bash
   cp .env.example .env
   ```
5. **Start the FastAPI backend server**:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```

### Frontend Setup
1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```
2. **Install Node dependencies**:
   ```bash
   npm install
   ```
3. **Copy environment variables**:
   ```bash
   cp .env.example .env
   ```
4. **Start the Vite development server**:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) or [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```
.
├── backend/
│   ├── alembic/                # Database migrations
│   ├── app/
│   │   ├── core/               # App config, security, caching, market hours, ws_manager
│   │   ├── db/                 # Database engine, session, and declarative Base
│   │   ├── models/             # User, Watchlist, Category, Alert ORM models
│   │   ├── routers/            # Auth, Markets, Watchlist, Categories, Alerts, WS endpoints
│   │   ├── schemas/            # Pydantic validation models
│   │   ├── services/           # Broadcaster, CurrencyService, DataFetcher
│   │   └── main.py             # FastAPI entrypoint & lifecycle handlers
│   ├── Dockerfile              # Backend container definition
│   └── requirements.txt        # Python package dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/         # StockChart, WatchlistTable, Modals, Tour, Themes
│   │   ├── context/            # Auth, Currency, Theme state providers
│   │   ├── hooks/              # useStockWebSocket real-time hook
│   │   ├── i18n/               # English & Hindi translation catalogs
│   │   ├── layouts/            # Dashboard layout with responsive mobile navigation
│   │   ├── pages/              # Overview, Markets, Watchlist, Settings, Login, Register
│   │   ├── services/           # Axios/Fetch API client & market service
│   │   └── types/              # TypeScript interface definitions
│   ├── nginx.conf              # Production Nginx reverse proxy & SPA configuration
│   ├── Dockerfile              # Multi-stage production frontend build
│   └── Dockerfile.dev          # Development frontend container
│
├── docker-compose.yml          # Production container orchestration
├── docker-compose.dev.yml      # Development container orchestration
└── README.md                   # Project documentation
```

---

## 🔒 Environment Variables Reference

| Variable | Scope | Default | Description |
|---|---|---|---|
| `PROJECT_NAME` | Backend | `StockMatrix API` | Application title shown in docs |
| `API_V1_STR` | Backend | `/api/v1` | Root API route prefix |
| `SECRET_KEY` | Backend | `(Random secret)` | Secret key for JWT encryption |
| `DATABASE_URL` | Backend | `sqlite:///./data/stock_dashboard.db` | SQLAlchemy connection string |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Backend | `1440` (24 hrs) | JWT expiration time |
| `CORS_ORIGINS` | Backend | `["http://localhost:3000"]` | Allowed CORS origins list |
| `VITE_API_URL` | Frontend | `http://localhost:8000` | Backend API base URL |

---

## 🧪 Testing & Verification

Run backend unit tests:
```bash
cd backend
pytest
```

Run frontend type check & build validation:
```bash
cd frontend
npm run build
```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
