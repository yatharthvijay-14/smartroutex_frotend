import axios from "axios";

// ─── Reverse Geocode ──────────────────────────────────────────────────────────
export const reverseGeocodeLocation = async (lat, lng) => {
  try {
    const res = await axios.get("https://nominatim.openstreetmap.org/reverse", {
      params: { lat, lon: lng, format: "json", addressdetails: 1 },
      headers: { "User-Agent": "SmartRouteX/2.0 (smartroutex.app)" },
      timeout: 5000
    });
    if (res.data?.display_name) {
      const addr = res.data.address || {};
      const name = addr.road || addr.suburb || addr.neighbourhood
                || addr.city_district || addr.city || res.data.display_name.split(",")[0];
      return { name, displayName: res.data.display_name, lat, lng };
    }
  } catch (err) {
    console.warn("Reverse geocode warning:", err.message);
  }
  return {
    name: `Location (${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)})`,
    displayName: `Coordinates: ${lat}, ${lng}`,
    lat, lng
  };
};

// ─── Detect User Physical Location ───────────────────────────────────────────
export const detectUserPhysicalLocation = () =>
  new Promise((resolve) => {
    if (!("geolocation" in navigator)) {
      resolve({ name: "Kota City Center", displayName: "Kota, Rajasthan, India", lat: 25.18, lng: 75.839 });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = await reverseGeocodeLocation(pos.coords.latitude, pos.coords.longitude);
        resolve(loc);
      },
      () => resolve({ name: "Kota City Center", displayName: "Kota, Rajasthan, India", lat: 25.18, lng: 75.839 }),
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 2000 }
    );
  });

// ─── Photon API — instant prefix autocomplete (like Google Places) ────────────
// Powered by Komoot's Photon: https://photon.komoot.io/
// Returns results instantly as user types, even for partial words like "tal"
export const searchPhoton = async (query) => {
  if (!query || query.trim().length < 1) return [];
  try {
    const res = await axios.get("https://photon.komoot.io/api/", {
      params: {
        q: query.trim(),
        limit: 8,
        lang: "en"
      },
      timeout: 4000
    });

    if (!res.data?.features?.length) return [];

    return res.data.features.map((f, i) => {
      const p = f.properties || {};
      const name = p.name || p.street || p.city || query;
      const parts = [p.street, p.city, p.state, p.country].filter(Boolean);
      const displayName = parts.length ? parts.join(", ") : (p.name || name);
      const [lng, lat] = f.geometry?.coordinates || [75.839, 25.18];
      return {
        id: `photon-${i}-${name}`,
        name,
        displayName,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        type: p.osm_value || p.type || "place",
        source: "photon"
      };
    });
  } catch (err) {
    console.warn("Photon search error:", err.message);
    return [];
  }
};

// ─── Nominatim Search (fallback) ──────────────────────────────────────────────
export const searchAddressNominatim = async (query) => {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: { q: `${query.trim()}, India`, format: "json", addressdetails: 1, limit: 6 },
      headers: { "User-Agent": "SmartRouteX/2.0" },
      timeout: 5000
    });
    if (!res.data?.length) return [];
    return res.data.map((item) => ({
      id: `nom-${item.place_id}`,
      name: item.name || item.display_name.split(",")[0],
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      type: item.type || item.class,
      source: "nominatim"
    }));
  } catch (err) {
    console.warn("Nominatim search error:", err.message);
    return [];
  }
};

// ─── OSRM Driving Route Engine ────────────────────────────────────────────────
export const fetchOSRMRoute = async (startLat, startLng, endLat, endLng) => {
  const sLat = Number(startLat).toFixed(4);
  const sLng = Number(startLng).toFixed(4);
  const eLat = Number(endLat).toFixed(4);
  const eLng = Number(endLng).toFixed(4);

  const endpoints = [
    `https://router.project-osrm.org/route/v1/driving/${sLng},${sLat};${eLng},${eLat}?overview=full&steps=true&geometries=geojson`,
    `https://routing.openstreetmap.de/routed-car/route/v1/driving/${sLng},${sLat};${eLng},${eLat}?overview=full&steps=true&geometries=geojson`
  ];

  for (const url of endpoints) {
    try {
      const response = await axios.get(url, { timeout: 6000 });
      if (response.data?.routes?.length > 0) {
        const parsedRoutes = response.data.routes.map((route, idx) => {
          const coords = route.geometry.coordinates.map((c) => [c[1], c[0]]);
          const distanceKm = (route.distance / 1000).toFixed(1);
          const durationMin = Math.round(route.duration / 60);
          const rawSteps = route.legs?.[0]?.steps || [];
          const navigationSteps = rawSteps.map((st, sIdx) => {
            const type = st.maneuver?.type || "straight";
            const modifier = st.maneuver?.modifier || "";
            const roadName = st.name || "Street Corridor";
            let icon = "straight";
            let instruction = `Continue on ${roadName}`;
            if (type === "depart") { icon = "depart"; instruction = `Head toward ${roadName}`; }
            else if (type === "arrive") { icon = "arrive"; instruction = `Arrive at destination: ${roadName}`; }
            else if (modifier.includes("left")) { icon = "left"; instruction = `Turn left onto ${roadName}`; }
            else if (modifier.includes("right")) { icon = "right"; instruction = `Turn right onto ${roadName}`; }
            const stepDistMeters = Math.round(st.distance);
            return {
              id: sIdx + 1, icon, instruction,
              streetName: st.name || "Street Corridor",
              distance: stepDistMeters > 1000 ? `${(stepDistMeters / 1000).toFixed(1)} km` : `${stepDistMeters} m`,
              duration: `${Math.max(1, Math.round(st.duration / 60))} min`,
              coordinates: st.geometry?.coordinates?.map((c) => [c[1], c[0]]) || [],
              location: st.maneuver?.location ? [st.maneuver.location[1], st.maneuver.location[0]] : null
            };
          });
          return {
            routeId: `route-${idx + 1}`,
            title: idx === 0 ? "Primary Driving Route" : `Alternate Bypass ${idx}`,
            coordinates: coords,
            distance: `${distanceKm} km`,
            duration: `${durationMin} mins`,
            steps: navigationSteps
          };
        });
        return {
          primaryRoute: parsedRoutes[0], allRoutes: parsedRoutes,
          coordinates: parsedRoutes[0].coordinates,
          distance: parsedRoutes[0].distance,
          duration: parsedRoutes[0].duration,
          steps: parsedRoutes[0].steps
        };
      }
    } catch (error) {
      console.warn(`OSRM "${url}" failed:`, error.message);
    }
  }
  return null;
};
