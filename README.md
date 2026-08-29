# 📍 SmartRouteX — AI-Powered Smart Navigation & Road Safety Platform

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-cyan.svg)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-GIS-green.svg)](https://leafletjs.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black.svg)](https://vercel.com/)

SmartRouteX Frontend is a state-of-the-art interactive Web GIS & Smart Navigation application designed to detect road hazards, evaluate route safety, provide real-time GPS telemetry, and block AI-generated fake hazard reports.

---

## 🌟 Key Features

### 📍 Real-Time GIS & Multi-Layer Mapping
- **Dual Map Modes**: Switch between **Satellite (Esri Imagery)** and **Street Map (OpenStreetMap)** views.
- **GPS Auto-Location**: Automatic device GPS positioning (`navigator.geolocation`) with high-accuracy fallback.
- **Interactive Map Markers**: Custom Google Maps-style navigation markers, hazard pins, and moving vehicle telemetry.

### 🤖 Client-Side AI Detection Engine
- **Anti-Fraud Media Verification**: Integrates custom computer vision signals (`aiDetectionService.js`) to scan uploaded photos for AI-generation signatures (grid frequencies, noise histograms, EXIF tags).
- **Instant Image Verification**: Blocks fake or AI-generated pothole uploads to maintain database integrity.

### 🧭 AI Safest vs. Direct Route Engine
- **OSRM Engine Integration**: Evaluates multiple driving paths in real time using the Open Source Routing Machine API.
- **Hazard Bypass Calculation**: Computes **Safest Safety Score (%)** vs **Direct Hazard Count** and visualizes both routes with color-coded polylines.

### 🏎️ Driver HUD Telemetry Mode
- Full-screen driver heads-up display (HUD) with dynamic speedometers, turn-by-turn instruction banners, hazard proximity warnings, and trip time estimation.

### 👤 User-Scoped "My Reports" Portal
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

## ⚙️ Environment Variables

```env
# URL of the Spring Boot Backend API
VITE_API_BASE_URL=https://smartroutex-backend.onrender.com

# Optional Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

---

## 🏁 Getting Started

```bash
# Clone the repository
git clone https://github.com/yatharthvijay-14/smartroutex_frontend.git
cd smartroutex_frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Run the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 📄 License

This project is licensed under the **MIT License**.
