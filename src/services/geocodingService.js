import axios from "axios";

// Helper: Ensure text is in English script and strip non-English/Devanagari characters if any
function ensureEnglish(text) {
  if (!text) return "";
  const containsHindi = /[\u0900-\u097F]/.test(text);
  if (containsHindi) {
    const cleaned = text.replace(/[\u0900-\u097F]+/g, "").replace(/\s+,/g, ",").replace(/,\s*,/g, ",").trim();
    if (cleaned && cleaned.length > 2) {
      return cleaned.replace(/^,\s*/, "").replace(/,\s*$/, "");
    }
  }
  return text;
}

// ─── Comprehensive Local Database of Kota Locations (Small & Big) ────────────
export const KOTA_LOCATIONS = [
  { id: "kota-1", name: "Talwandi Main Road", displayName: "Talwandi Main Road, Kota, Rajasthan", lat: 25.1510, lng: 75.8420, type: "area" },
  { id: "kota-2", name: "Talwandi Circle", displayName: "Talwandi Circle, Sector A, Kota", lat: 25.1520, lng: 75.8430, type: "junction" },
  { id: "kota-3", name: "Aerodrome Circle", displayName: "Aerodrome Circle, Jhalawar Road, Kota", lat: 25.1800, lng: 75.8390, type: "circle" },
  { id: "kota-4", name: "Jhalawar Road Expressway", displayName: "Jhalawar Road Corridor, Kota", lat: 25.2138, lng: 75.8648, type: "highway" },
  { id: "kota-5", name: "Vigyan Nagar Flyover", displayName: "Vigyan Nagar Flyover, Kota", lat: 25.1810, lng: 75.8390, type: "flyover" },
  { id: "kota-6", name: "Vigyan Nagar Main Market", displayName: "Vigyan Nagar Sector 1-4, Kota", lat: 25.1780, lng: 75.8420, type: "market" },
  { id: "kota-7", name: "Mahaveer Nagar 1", displayName: "Mahaveer Nagar Extension 1, Kota", lat: 25.1700, lng: 75.8500, type: "colony" },
  { id: "kota-8", name: "Mahaveer Nagar 2", displayName: "Mahaveer Nagar Sector 2, Kota", lat: 25.1680, lng: 75.8530, type: "colony" },
  { id: "kota-9", name: "Mahaveer Nagar 3", displayName: "Mahaveer Nagar Sector 3, Kota", lat: 25.1650, lng: 75.8550, type: "colony" },
  { id: "kota-10", name: "Rajeev Gandhi Nagar", displayName: "Rajeev Gandhi Nagar Coaching Hub, Kota", lat: 25.1600, lng: 75.8700, type: "coaching_hub" },
  { id: "kota-11", name: "Allen Samyak (Landmark City)", displayName: "Landmark City, Kunhari, Kota", lat: 25.2150, lng: 75.8320, type: "coaching" },
  { id: "kota-12", name: "Allen Supath (Naya Nohar)", displayName: "Naya Nohar, Baran Road, Kota", lat: 25.1610, lng: 75.8690, type: "coaching" },
  { id: "kota-13", name: "Allen Sangyan", displayName: "Rajeev Gandhi Nagar, Kota", lat: 25.1590, lng: 75.8680, type: "coaching" },
  { id: "kota-14", name: "Allen Sankalp", displayName: "Indraprastha Industrial Area, Kota", lat: 25.1720, lng: 75.8490, type: "coaching" },
  { id: "kota-15", name: "Dadabari Choraaha", displayName: "Dadabari Main Choraaha, Kota", lat: 25.1620, lng: 75.8330, type: "junction" },
  { id: "kota-16", name: "Dadabari Main Market", displayName: "Dadabari Sector 1-7, Kota", lat: 25.1610, lng: 75.8340, type: "market" },
  { id: "kota-17", name: "Kota Junction Railway Station", displayName: "Kota Railway Station Road, Station Area", lat: 25.2180, lng: 75.8620, type: "station" },
  { id: "kota-18", name: "Nayapura Heritage Gate", displayName: "Nayapura Gate & Heritage Road, Kota", lat: 25.1820, lng: 75.8400, type: "heritage" },
  { id: "kota-19", name: "Nayapura Bus Stand", displayName: "Interstate Bus Terminal, Nayapura, Kota", lat: 25.1850, lng: 75.8410, type: "bus_stand" },
  { id: "kota-20", name: "Seven Wonders Park", displayName: "Kishore Sagar Lake Promenade, Kota", lat: 25.1730, lng: 75.8410, type: "park" },
  { id: "kota-21", name: "Kishore Sagar Lake", displayName: "Jagmandir Palace & Lake, Kota", lat: 25.1750, lng: 75.8430, type: "lake" },
  { id: "kota-22", name: "Kota Thermal Power Station", displayName: "Thermal Power Colony, Sakatpura, Kota", lat: 25.1880, lng: 75.8150, type: "landmark" },
  { id: "kota-23", name: "Kota Government Medical College", displayName: "New Medical College Hospital, Rangbari Road, Kota", lat: 25.1480, lng: 75.8280, type: "hospital" },
  { id: "kota-24", name: "Rangbari Road", displayName: "Rangbari Main Corridor, Kota", lat: 25.1490, lng: 75.8310, type: "road" },
  { id: "kota-25", name: "Rangbari Circle", displayName: "Rangbari Circle, Kota", lat: 25.1500, lng: 75.8320, type: "junction" },
  { id: "kota-26", name: "Gumanpura Market", displayName: "Shopping Centre & Gumanpura Market, Kota", lat: 25.1790, lng: 75.8480, type: "market" },
  { id: "kota-27", name: "Rampura Main Bazaar", displayName: "Old City Rampura, Kota", lat: 25.1860, lng: 75.8450, type: "market" },
  { id: "kota-28", name: "Chawani Choraaha", displayName: "Chawani Circle, Kota", lat: 25.1760, lng: 75.8510, type: "junction" },
  { id: "kota-29", name: "Borkheda Flyover", displayName: "Baran Road, Borkheda, Kota", lat: 25.1920, lng: 75.8810, type: "flyover" },
  { id: "kota-30", name: "Kunhari Choraaha", displayName: "Bundi Road, Kunhari, Kota", lat: 25.2050, lng: 75.8350, type: "junction" },
  { id: "kota-31", name: "Sakatpura Dam", displayName: "Kota Barrage Dam & Sakatpura, Kota", lat: 25.1950, lng: 75.8100, type: "dam" },
  { id: "kota-32", name: "Shrinath Puram Stadium", displayName: "Shrinath Puram Sports Complex, Kota", lat: 25.1580, lng: 75.8250, type: "stadium" },
  { id: "kota-33", name: "RK Puram Sector A/B", displayName: "Radhakrishnan Puram, Kota", lat: 25.1530, lng: 75.8210, type: "colony" },
  { id: "kota-34", name: "Indraprastha Industrial Area", displayName: "IPIA Sector 1-5, Kota", lat: 25.1420, lng: 75.8750, type: "industrial" },
  { id: "kota-35", name: "DCM Circle", displayName: "DCM Road Junction, Kota", lat: 25.1400, lng: 75.8700, type: "junction" },
  { id: "kota-36", name: "Ranpur Industrial Zone", displayName: "RIICO Industrial Area, Ranpur, Kota", lat: 25.0950, lng: 75.8550, type: "industrial" },
  { id: "kota-37", name: "Engineering College (RTU Kota)", displayName: "Rajasthan Technical University Campus, Rawatbhata Road", lat: 25.1410, lng: 75.8050, type: "university" },
  { id: "kota-38", name: "City Mall Kota", displayName: "Jhalawar Road City Mall, Kota", lat: 25.1630, lng: 75.8520, type: "mall" }
];

// ─── Reverse Geocode ──────────────────────────────────────────────────────────
export const reverseGeocodeLocation = async (lat, lng) => {
  try {
    const res = await axios.get("https://nominatim.openstreetmap.org/reverse", {
      params: {
        lat,
        lon: lng,
        format: "json",
        addressdetails: 1,
        "accept-language": "en-US,en;q=0.9"
      },
      headers: {
        "User-Agent": "SmartRouteX/2.0 (smartroutex.app)",
        "Accept-Language": "en-US,en;q=0.9"
      },
      timeout: 5000
    });

    if (res.data?.display_name) {
      const addr = res.data.address || {};
      let name = addr.road || addr.suburb || addr.neighbourhood
                || addr.city_district || addr.city || res.data.display_name.split(",")[0];

      name = ensureEnglish(name) || `Location (${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)})`;
      let displayName = ensureEnglish(res.data.display_name) || name;

      return { name, displayName, lat, lng };
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

// ─── Photon API — instant prefix autocomplete ─────────────────────────────────
export const searchPhoton = async (query) => {
  if (!query || query.trim().length < 1) return [];
  try {
    const res = await axios.get("https://photon.komoot.io/api/", {
      params: {
        q: `${query.trim()} Kota India`,
        limit: 8,
        lang: "en"
      },
      timeout: 4000
    });

    if (!res.data?.features?.length) return [];

    return res.data.features.map((f, i) => {
      const p = f.properties || {};
      const name = ensureEnglish(p.name || p.street || p.city || query);
      const parts = [p.street, p.city, p.state, p.country].filter(Boolean).map(ensureEnglish);
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

// ─── Nominatim Search (OpenStreetMap Full Search API) ──────────────────────────
export const searchAddressNominatim = async (query) => {
  if (!query || query.trim().length < 1) return [];
  try {
    const res = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: `${query.trim()}, Kota, Rajasthan, India`,
        format: "json",
        addressdetails: 1,
        limit: 10,
        "accept-language": "en-US,en;q=0.9"
      },
      headers: {
        "User-Agent": "SmartRouteX/2.0",
        "Accept-Language": "en-US,en;q=0.9"
      },
      timeout: 5000
    });
    if (!res.data?.length) return [];
    return res.data.map((item) => ({
      id: `nom-${item.place_id}`,
      name: ensureEnglish(item.name || item.display_name.split(",")[0]),
      displayName: ensureEnglish(item.display_name),
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

// ─── Unified All-Location Search Engine (Small & Big Locations) ───────────────
export const searchAllLocations = async (query) => {
  if (!query || !query.trim()) return [];
  const q = query.trim().toLowerCase();

  // 1. Local Database Search (0ms instant response)
  const localMatches = KOTA_LOCATIONS.filter(item =>
    item.name.toLowerCase().includes(q) ||
    item.displayName.toLowerCase().includes(q)
  );

  // 2. Fetch online places via Nominatim and Photon APIs
  let onlineResults = [];
  try {
    const [nom, pho] = await Promise.allSettled([
      searchAddressNominatim(query),
      searchPhoton(query)
    ]);
    const nomData = nom.status === "fulfilled" ? nom.value : [];
    const phoData = pho.status === "fulfilled" ? pho.value : [];
    onlineResults = [...nomData, ...phoData];
  } catch (_) {}

  // 3. Combine and Deduplicate
  const combined = [...localMatches];
  onlineResults.forEach(item => {
    const isDup = combined.some(c =>
      c.name.toLowerCase() === item.name.toLowerCase() ||
      (Math.abs(c.lat - item.lat) < 0.0015 && Math.abs(c.lng - item.lng) < 0.0015)
    );
    if (!isDup) combined.push(item);
  });

  return combined;
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
