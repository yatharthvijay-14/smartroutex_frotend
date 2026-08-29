# 📍 SmartRouteX — AI-Powered Smart Navigation & Road Safety Platform

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-cyan.svg)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-GIS-green.svg)](https://leafletjs.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black.svg)](https://vercel.com/)

SmartRouteX Frontend is a state-of-the-art interactive Web GIS & Smart Navigation application designed to detect road hazards, evaluate route safety, provide real-time GPS telemetry, and block AI-generated fake hazard reports.

---

## 🌟 Key Features

### 📍 1. Real-Time GIS & Multi-Layer Mapping
- **Dual Map Modes**: Switch between **Satellite (Esri Imagery)** and **Street Map (OpenStreetMap)** views.
- **GPS Auto-Location**: Automatic device GPS positioning (`navigator.geolocation`) with high-accuracy fallback.
- **Interactive Map Markers**: Custom Google Maps-style navigation markers, hazard pins, and moving vehicle telemetry.

### 🤖 2. Client-Side AI Detection Engine
- **Anti-Fraud Media Verification**: Integrates custom computer vision signals (`aiDetectionService.js`) to scan uploaded photos for AI-generation signatures (grid frequencies, noise histograms, EXIF tags).
- **Instant Image Verification**: Blocks fake or AI-generated pothole uploads to maintain database integrity.

### 🧭 3. AI Safest vs. Direct Route Engine
- **OSRM Engine Integration**: Evaluates multiple driving paths in real time using the Open Source Routing Machine API.
- **Hazard Bypass Calculation**: Computes **Safest Safety Score (%)** vs **Direct Hazard Count** and visualizes both routes with color-coded polylines.

### 🏎️ 4. Driver HUD Telemetry Mode
- Full-screen driver heads-up display (HUD) with dynamic speedometers, turn-by-turn instruction banners, hazard proximity warnings, and trip time estimation.

### 👤 5. User-Scoped "My Reports" Portal
- Personal dashboard for registered users to monitor, edit, remove photo evidence from, or mark their submitted road hazard reports as FIXED.

---

## 🛠️ Technology Stack

| Category | Library / Service |
| :--- | :--- |
| **Framework** | React 18, Vite 8 |
| **Styling** | Custom Vanilla CSS + Tailwind CSS |
| **Icons** | Lucide React |
| **Map Rendering** | Leaflet, React-Leaflet |
| **Map Tiles** | Esri World Imagery, OpenStreetMap, CartoDB Voyager |
| **Routing Engine** | OSRM (Open Source Routing Machine) API |
| **Geocoding & Autocomplete** | Komoot Photon API, OpenStreetMap Nominatim API |
| **State & Auth** | React Context API (`AuthContext`), LocalStorage |
| **HTTP Client** | Axios |
| **Deployment** | Vercel |

---

## 📁 Project Architecture

```text
frontend/src/
├── assets/         # App graphics & SVGs
├── components/     # Reusable UI components
│   ├── LiveMap.jsx                 # Interactive GIS Map Component
│   ├── GoogleMapRouteBar.jsx       # Route calculation & search input bar
│   ├── GoogleMapDirectionsPanel.jsx # Turn-by-turn navigation steps
│   ├── ReportPotholeModal.jsx      # Hazard reporting with AI Scanner
│   ├── DriverHudModal.jsx          # Driver HUD cockpit simulator
│   ├── MyReports.jsx               # User hazard report management
│   ├── AuthModal.jsx               # User authentication modal
│   └── ...
├── context/        # React Context (AuthContext)
├── hooks/          # Custom hooks (useRealTimeData)
├── pages/          # Primary views (Dashboard, AuthPage)
├── services/
│   ├── api.js                      # Axios API service connecting to Spring Boot backend
│   ├── aiDetectionService.js       # Client-side AI image verification engine
│   └── geocodingService.js         # OSRM & Photon Geocoding services
├── App.jsx         # App router & shell
├── main.jsx        # App entry point
└── index.css       # Core styling & glassmorphism theme tokens
```

---

## ⚙️ Environment Variables

Create `.env` in the `frontend` folder:

```env
# URL of the Spring Boot Backend API
VITE_API_BASE_URL=https://smartroutex-backend.onrender.com

# Optional Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

---

## 💻 Local Setup & Development

### Prerequisites:
- Node.js 18+ & npm

### Steps:
1. Clone the frontend repository:
   ```bash
   git clone https://github.com/yatharthvijay-14/smartroutex_frotend.git
   cd smartroutex_frotend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the local development server:
   ```bash
   npm run dev
   ```
4. Open your browser at `http://localhost:5173`.

---

## 📦 Production Build

To build the production bundle:
```bash
npm run build
```
Output will be generated in the `dist/` directory ready for deployment on Vercel or Netlify.
