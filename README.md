# World Explorer MCP

A full-stack web application demonstrating the **Model Context Protocol (MCP)** — connecting applications to real-time tools and external services without any AI or LLM.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React + Vite)                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │ WorldMap │ │ Sidebar  │ │ Navbar   │ │ CompareView   │  │
│  │ (Leaflet)│ │ (Country │ │ (Search, │ │ (Side-by-side)│  │
│  │          │ │  Info)   │ │  Nav)    │ │              │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────────┘  │
│                        │ HTTP POST                         │
└────────────────────────┼────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 Backend (Express + MCP SDK)                 │
│  ┌──────────────┐   ┌──────────────┐   ┌────────────────┐  │
│  │  Express API  │──▶│  MCP Client  │──▶│  MCP Server    │  │
│  │  /api/country │   │  (In-Memory  │   │  (In-Memory    │  │
│  │  /api/compare │   │   Transport) │   │   Transport)   │  │
│  └──────────────┘   └──────────────┘   └───────┬────────┘  │
│                                                 │           │
└─────────────────────────────────────────────────┼───────────┘
                                                   │
                    ┌──────────────────────────────┼──────────────────┐
                    │          MCP Tools           │                  │
                    ▼          ▼          ▼        ▼                  │
              ┌─────────┐ ┌─────────┐ ┌──────────┐                │
              │REST     │ │ wttr.in │ │ Frankfurter│               │
              │Countries│ │ Weather │ │ Exchange  │               │
              │  API    │ │   API   │ │   Rates   │               │
              └─────────┘ └─────────┘ └──────────┘                │
                    ▲          ▲          ▲                       │
                    └──────────┴──────────┘───────────────────────┘
                          External Services
```

The frontend never communicates directly with external APIs. All requests go through:

```
Frontend → Express Backend → MCP Client → MCP Server → External APIs
```

## Features

- **Interactive World Map** — Pan, zoom, and click countries on a dark-themed Leaflet map
- **Country Information** — Capital, population, languages, currency, timezone, coordinates, flag
- **Live Weather** — Current conditions, temperature, humidity, wind speed, UV index
- **5‑Day Forecast** — Mini weather chart with temperature ranges and rain probability
- **Currency Exchange** — Live conversion rates via MCP tools
- **Country Comparison** — Compare two countries side by side
- **Search** — Autocomplete search with keyboard shortcut (`Ctrl+K`)
- **Favorites** — Save favorite countries to LocalStorage
- **History** — Recently viewed countries
- **Export** — Download country information as JSON
- **Glassmorphism UI** — Blurred glass cards with dark gradients
- **Animations** — Framer Motion page transitions, slide-in panels, hover effects

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, TypeScript, Tailwind CSS 3 |
| Mapping | Leaflet + react-leaflet |
| Animations | Framer Motion 11 |
| Icons | Lucide React |
| Backend | Node.js, Express 4 |
| MCP | @modelcontextprotocol/sdk |
| Data Sources | REST Countries API, wttr.in, Frankfurter API |

## Getting Started

### Prerequisites

- Node.js 18+ (20+ recommended)
- npm 9+

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd world-explorer-mcp

# Install all dependencies (root + backend + frontend)
npm install
cd backend && npm install && cd ../frontend && npm install && cd ..
```

### Running Locally

```bash
# Start both backend and frontend concurrently
npm run dev
```

This starts:
- Backend on **http://localhost:3001**
- Frontend on **http://localhost:5173**

Or run them separately:

```bash
# Terminal 1 - Backend
cd backend && node server.js

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### How MCP Works in This App

1. The Node.js backend creates an **MCP Server** with tool definitions (`get_countries`, `get_country_info`, `get_weather`, `get_forecast`, `convert_currency`).
2. An **MCP Client** connects to the server via in-memory transport.
3. Express routes receive frontend requests and call the MCP client.
4. The MCP server executes the requested tool, fetching data from external APIs.
5. Results flow back: MCP Server → MCP Client → Express → Frontend.

No AI, no LLM — pure tool orchestration through the Model Context Protocol.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/countries` | List all countries |
| POST | `/api/countries/info` | Get detailed country info |
| POST | `/api/countries/compare` | Compare two countries |
| POST | `/api/countries/weather` | Get current weather |
| POST | `/api/countries/forecast` | Get 5-day forecast |
| POST | `/api/countries/convert` | Convert currency |
| GET | `/api/health` | Health check |

### Example Request

```json
POST /api/countries/info
{
  "country": "Japan"
}
```

## Deployment

### Frontend to GitHub Pages

A GitHub Actions workflow is included (`.github/workflows/deploy.yml`). It automatically builds and deploys the frontend to GitHub Pages on pushes to the `main` branch.

1. Enable GitHub Pages in your repo settings (Source: GitHub Actions).
2. Push to `main` — the workflow handles the rest.

### Backend to Render

1. Create a new Web Service on Render.
2. Set the **Root Directory** to `backend`.
3. Set the **Build Command** to `npm install`.
4. Set the **Start Command** to `node server.js`.
5. Add environment variable: `PORT=3001`.

## Project Structure

```
world-explorer-mcp/
├── backend/
│   ├── server.js          # Express entry point
│   ├── mcpServer.js       # MCP server with tool definitions
│   ├── mcpClient.js       # MCP client connecting to server
│   └── routes/
│       └── countries.js   # API route handlers
├── frontend/
│   ├── src/
│   │   ├── App.tsx        # Main application component
│   │   ├── api.ts         # HTTP client for backend
│   │   ├── types.ts       # TypeScript type definitions
│   │   ├── index.css      # Global styles + Tailwind
│   │   ├── components/
│   │   │   ├── WorldMap.tsx       # Leaflet map with GeoJSON
│   │   │   ├── Sidebar.tsx        # Country info slide-in panel
│   │   │   ├── Navbar.tsx         # Top navigation + search
│   │   │   ├── CompareView.tsx    # Side-by-side comparison
│   │   │   ├── History.tsx        # Recent countries
│   │   │   ├── WeatherChart.tsx   # 5-day forecast chart
│   │   │   └── Footer.tsx         # App footer
│   │   └── hooks/
│   │       └── useLocalStorage.ts # LocalStorage hook
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── index.html
├── .github/workflows/
│   └── deploy.yml         # GitHub Pages deployment
├── package.json           # Root workspace scripts
└── README.md
```

## Screenshots

<!-- Add screenshots here after running the application -->

## License

MIT
