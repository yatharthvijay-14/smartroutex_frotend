import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Custom Google Maps Markers
const createStartIcon = () =>
  L.divIcon({
    className: "start-map-pin",
    html: `<div class="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-2xl border-2 border-white ring-4 ring-blue-500/40">📍</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });

const createEndIcon = () =>
  L.divIcon({
    className: "end-map-pin",
    html: `<div class="relative flex items-center justify-center">
             <div class="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-base shadow-2xl border-2 border-white">🎯</div>
             <div class="absolute -bottom-1 w-3 h-1.5 bg-black/60 rounded-full blur-xs"></div>
           </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });

// Real GPS Vehicle Position Marker (Blue Navigation Arrow)
const createVehicleNavIcon = (heading = 45) =>
  L.divIcon({
    className: "vehicle-gmap-nav-pin",
    html: `<div class="relative flex items-center justify-center w-12 h-12">
             <div class="absolute inset-0 rounded-full bg-blue-500/30 animate-ping"></div>
             <div class="w-11 h-11 rounded-full bg-white shadow-2xl flex items-center justify-center border-2 border-blue-600">
               <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-md transform rotate-${heading}">
                 ▲
               </div>
             </div>
           </div>`,
    iconSize: [48, 48],
    iconAnchor: [24, 24]
  });

const createPotholeWarningIcon = () =>
  L.divIcon({
    className: "pothole-warning-pin",
    html: `<div class="w-9 h-9 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-2xl border-2 border-white ring-4 ring-amber-500/40 animate-bounce">⚠️</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      if (onMapClick) onMapClick(e.latlng);
    }
  });
  return null;
}

function ChangeMapView({ center, zoom = 15 }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

function LiveMap({
  roads = [],
  selectedRoad = null,
  startPoint = null,
  setStartPoint = null,
  endPoint = null,
  setEndPoint = null,
  routePlan = null,
  selectedRouteType = "SAFEST",
  selectedCandidateRouteId = null,
  isSelectingOnMap = false,
  setIsSelectingOnMap = null,
  currentVehiclePos = null,
  isRealGpsActive = true,
  setIsRealGpsActive = null,
  gpsAccuracy = 10,
  dynamicEtaMinutes = 0,
  dynamicDistanceText = "-- km",
  onSimulateDrive = null,
  onOpenHudModal = null
}) {
  const [mapType, setMapType] = useState("SATELLITE"); // Satellite view by default

  const hasLocation = !!(currentVehiclePos || startPoint || endPoint);
  const centerLat = currentVehiclePos?.[0] || startPoint?.lat || endPoint?.lat || 20.5937;
  const centerLng = currentVehiclePos?.[1] || startPoint?.lng || endPoint?.lng || 78.9629;
  const mapZoom = hasLocation ? 15 : 5;

  const handleMapClick = (latlng) => {
    if (!startPoint || (startPoint && endPoint)) {
      if (setStartPoint) {
        setStartPoint({
          name: `Start (${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)})`,
          lat: latlng.lat,
          lng: latlng.lng
        });
      }
      if (setEndPoint) setEndPoint(null);
    } else if (startPoint && !endPoint) {
      if (setEndPoint) {
        setEndPoint({
          name: `Destination (${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)})`,
          lat: latlng.lat,
          lng: latlng.lng
        });
      }
      if (setIsSelectingOnMap) setIsSelectingOnMap(false);
    }
  };

  const directPath = routePlan?.directPath || [];
  const safestPath = routePlan?.safestPath || [];
  const potholeHazards = routePlan?.nearbyPotholes || [];

  const vehiclePos = currentVehiclePos || (startPoint ? [startPoint.lat, startPoint.lng] : null);

  return (
    <div className="relative w-full h-[640px] rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950 font-sans flex flex-col">
      {/* 📡 Live GPS Status Top Badge */}
      <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2">
        <button
          onClick={() => {
            if (setIsRealGpsActive) setIsRealGpsActive(!isRealGpsActive);
          }}
          className={`px-4 py-2 rounded-2xl shadow-xl font-bold text-xs border backdrop-blur-md transition-all flex items-center gap-2 ${
            isRealGpsActive
              ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/50"
              : "bg-slate-900/90 text-slate-300 border-slate-700"
          }`}
        >
          <span className={isRealGpsActive ? "w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" : "w-2.5 h-2.5 rounded-full bg-slate-500"} />
          {isRealGpsActive ? `📡 Real Device GPS Active (±${gpsAccuracy}m)` : "🚘 Manual / Sim Mode"}
        </button>
      </div>

      {/* Map Mode & Geolocation Controls (Top Right) */}
      <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2">
        {onOpenHudModal && (
          <button
            onClick={onOpenHudModal}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-2 rounded-xl shadow-xl font-extrabold text-xs hover:from-purple-500 hover:to-indigo-500 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Launch Driver HUD Mode Telemetry Simulator"
          >
            <span>🏎️</span> Drive HUD
          </button>
        )}

        <button
          onClick={() => {
            if ("geolocation" in navigator) {
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  const lat = pos.coords.latitude;
                  const lng = pos.coords.longitude;
                  if (setStartPoint) {
                    setStartPoint({
                      name: `My Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
                      lat,
                      lng
                    });
                  }
                  if (onSimulateDrive) {
                    onSimulateDrive([lat, lng]);
                  }
                },
                (err) => alert("Could not access GPS location: " + err.message),
                { enableHighAccuracy: true, timeout: 8000 }
              );
            } else {
              alert("Geolocation is not supported by your browser.");
            }
          }}
          className="bg-white/90 backdrop-blur-md text-slate-800 px-3 py-2 rounded-xl shadow-xl font-bold text-xs border border-slate-200 hover:bg-white transition-all flex items-center gap-1.5 cursor-pointer"
          title="Center Map on My Current Location"
        >
          <span className="text-blue-600">🎯</span> My Location
        </button>

        <button
          onClick={() => setMapType(mapType === "SATELLITE" ? "STREET" : "SATELLITE")}
          className="bg-white/90 backdrop-blur-md text-slate-800 px-3.5 py-2 rounded-xl shadow-xl font-bold text-xs border border-slate-200 hover:bg-white transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>🛰️</span> {mapType === "SATELLITE" ? "Satellite" : "Street"}
        </button>
      </div>

      {/* Leaflet Canvas */}
      <div className="relative w-full h-full z-0">
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={mapZoom}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
          scrollWheelZoom={true}
        >
          {mapType === "SATELLITE" ? (
            <>
              <TileLayer
                attribution='&copy; <a href="https://www.esri.com">Esri</a>, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
              />
            </>
          ) : (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          )}

          <MapClickHandler onMapClick={handleMapClick} />

          {(vehiclePos || endPoint || selectedRoad) && (
            <ChangeMapView
              center={vehiclePos || [endPoint?.lat || selectedRoad?.latitude, endPoint?.lng || selectedRoad?.longitude]}
              zoom={15}
            />
          )}

          {/* 📍 START LOCATION MARKER */}
          {startPoint && (
            <Marker position={[startPoint.lat, startPoint.lng]} icon={createStartIcon()}>
              <Popup>
                <div className="p-1 font-bold text-xs">
                  <span className="text-blue-600">📍 Start:</span> {startPoint.name}
                </div>
              </Popup>
            </Marker>
          )}

          {/* 🎯 DESTINATION MARKER */}
          {endPoint && (
            <Marker position={[endPoint.lat, endPoint.lng]} icon={createEndIcon()}>
              <Popup>
                <div className="p-1 font-bold text-xs">
                  <span className="text-rose-600">🎯 Destination:</span> {endPoint.name}
                </div>
              </Popup>
            </Marker>
          )}

          {/* 🚘 MOVING GPS VEHICLE MARKER */}
          {vehiclePos && (
            <Marker position={vehiclePos} icon={createVehicleNavIcon(45)} zIndexOffset={1000}>
              <Popup>
                <div className="p-1 font-bold text-xs text-blue-600 flex items-center gap-1">
                  <span>▲</span> Vehicle Position {endPoint && dynamicEtaMinutes > 0 ? `(${dynamicEtaMinutes} mins to dest)` : "(GPS Active)"}
                </div>
              </Popup>
            </Marker>
          )}

          {/* 🔵 PRIMARY DRIVING ROUTE (SOLID BLUE LINE) */}
          {safestPath && safestPath.length >= 2 && (
            <Polyline
              positions={safestPath}
              pathOptions={{
                color: "#2563eb",
                weight: 8,
                opacity: 0.95,
                lineCap: "round",
                lineJoin: "round"
              }}
            />
          )}

          {/* 🔴 HAZARDOUS DIRECT ROUTE (DASHED GREY LINE WITH POTHOLES) */}
          {directPath && directPath.length >= 2 && (
            <Polyline
              positions={directPath}
              pathOptions={{
                color: "#64748b",
                weight: 6,
                opacity: 0.7,
                dashArray: "6, 8"
              }}
            />
          )}

          {/* ⚠️ POTHOLE HAZARD PINS WITH PHOTO PREVIEW */}
          {potholeHazards &&
            potholeHazards.map((pothole, idx) => {
              const photo = pothole.imageUrl || "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop";
              return (
                <Marker
                  key={`hazard-${pothole.id || idx}`}
                  position={[pothole.latitude || centerLat, pothole.longitude || centerLng]}
                  icon={createPotholeWarningIcon()}
                  zIndexOffset={900}
                >
                  <Popup>
                    <div className="p-1 text-xs max-w-xs">
                      <span className="font-black text-rose-600 text-sm flex items-center gap-1">
                        ⚠️ POTHOLE HAZARD
                      </span>
                      {photo && (
                        <div className="my-1.5 rounded-lg overflow-hidden border border-slate-300">
                          <img src={photo} alt="Pothole photo" className="w-full h-24 object-cover" />
                        </div>
                      )}
                      <p className="mt-1 text-slate-800 font-bold">
                        {pothole.roadName || "Pothole Zone"}
                      </p>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 border-t pt-1">
                        <span>Depth: <strong className="text-amber-600">{pothole.depth || "15 cm"}</strong></span>
                        <span className="text-emerald-700 font-bold">🟢 Avoided</span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>
      </div>

      {/* ⚪ BOTTOM EXPECTED TIME TO REACH CARD */}
      <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-white text-slate-900 p-4 rounded-3xl shadow-2xl border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-bold shadow-inner">
            🚘
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black text-amber-700">
                {endPoint && dynamicEtaMinutes > 0 ? `${dynamicEtaMinutes} mins` : "-- mins"}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                {isRealGpsActive ? "GPS Tracking Active" : "Sim Mode"}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold m-0 mt-0.5 flex items-center gap-2">
              <span>{endPoint ? dynamicDistanceText : "Select destination to calculate ETA"}</span> • <span>Destination: {endPoint?.name || "Not Selected"}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {!isRealGpsActive && onSimulateDrive && (
            <button
              onClick={onSimulateDrive}
              className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-xl transition-all flex items-center gap-1.5"
            >
              <span>▶</span> Test Move
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default LiveMap;