import axios from "axios";

// ─── Helper: English Text Sanitizer ──────────────────────────────────────────
function sanitizeToEnglish(text) {
  if (!text) return "";
  // Strip Devanagari / Hindi script if present
  const containsHindi = /[\u0900-\u097F]/.test(text);
  if (containsHindi) {
    const cleaned = text.replace(/[\u0900-\u097F]+/g, "").replace(/\s+,/g, ",").replace(/,\s*,/g, ",").trim();
    if (cleaned && cleaned.length > 2) {
      return cleaned.replace(/^,\s*/, "").replace(/,\s*$/, "");
    }
  }
  return text;
}

// ─── Comprehensive Kota Local Verified Places Database ────────────────────────
export const KOTA_LOCAL_PLACES = [
  // Malls & Parks
  { id: "p-m1", name: "City Mall Kota", displayName: "City Mall, Jhalawar Road (Opposite City Park), Kota", lat: 25.1488, lng: 75.8524, type: "mall" },
  { id: "p-p1", name: "Oxyzone City Park Kota", displayName: "Oxyzone City Park (Opposite City Mall), Jhalawar Road, Kota", lat: 25.1492, lng: 75.8505, type: "park" },
  { id: "p-p2", name: "Seven Wonders Park", displayName: "Seven Wonders Promenade, Kishore Sagar Lake, Kota", lat: 25.1730, lng: 75.8410, type: "park" },
  { id: "p-p3", name: "Chambal Garden", displayName: "Chambal Garden Park, Chambal River Bank, Kota", lat: 25.1550, lng: 75.8180, type: "park" },
  { id: "p-l1", name: "Kishore Sagar Lake", displayName: "Jagmandir Palace & Kishore Sagar Lake, Kota", lat: 25.1750, lng: 75.8430, type: "lake" },

  // Temples
  { id: "p-t1", name: "Godavari Dham Hanuman Temple", displayName: "Godavari Dham Hanuman Mandir, Chambal River Bank, Kota", lat: 25.1780, lng: 75.8150, type: "temple" },
  { id: "p-t2", name: "Khade Ganesh Ji Temple", displayName: "Khade Ganesh Ji Temple, Ganesh Nagar, Kota", lat: 25.1320, lng: 75.8340, type: "temple" },
  { id: "p-t3", name: "Karneshwar Mahadev Temple", displayName: "Karneshwar Mahadev Temple, Rawatbhata Road, Kota", lat: 25.1450, lng: 75.8210, type: "temple" },
  { id: "p-t4", name: "Garadia Mahadev Temple", displayName: "Garadia Mahadev Canyon Temple, Chambal Gorge, Kota", lat: 25.0750, lng: 75.6980, type: "temple" },
  { id: "p-t5", name: "Mathuradheesh Temple Rampura", displayName: "Mathuradheesh Ji Temple, Old City Rampura, Kota", lat: 25.1870, lng: 75.8440, type: "temple" },

  // Hospitals
  { id: "p-h1", name: "MBS Hospital Kota", displayName: "Maharao Bhim Singh Government Hospital, Nayapura, Kota", lat: 25.1840, lng: 75.8420, type: "hospital" },
  { id: "p-h2", name: "New Medical College Hospital Kota", displayName: "Government New Medical College Hospital, Rangbari Road, Kota", lat: 25.1480, lng: 75.8280, type: "hospital" },
  { id: "p-h3", name: "JK Lon Hospital Kota", displayName: "JK Lon Mother & Child Hospital, Nayapura, Kota", lat: 25.1830, lng: 75.8430, type: "hospital" },
  { id: "p-h4", name: "Jay Kay Hospital Talwandi", displayName: "Jay Kay Multispeciality Hospital, Talwandi, Kota", lat: 25.1540, lng: 75.8440, type: "hospital" },

  // Cafes & Food
  { id: "p-c1", name: "The Brew Room Cafe Talwandi", displayName: "The Brew Room Cafe, Talwandi Main Road, Kota", lat: 25.1525, lng: 75.8425, type: "cafe" },
  { id: "p-c2", name: "Cafe Coffee Day Jhalawar Road", displayName: "CCD, Near City Mall, Jhalawar Road, Kota", lat: 25.1710, lng: 75.8510, type: "cafe" },
  { id: "p-c3", name: "McDonald's City Mall Kota", displayName: "McDonald's, Ground Floor City Mall, Kota", lat: 25.1489, lng: 75.8525, type: "restaurant" },
  { id: "p-c4", name: "Domino's Pizza Talwandi", displayName: "Domino's Pizza, Talwandi Sector A, Kota", lat: 25.1518, lng: 75.8422, type: "restaurant" },

  // Coaching & Education
  { id: "p-e1", name: "Allen Samyak (Landmark City)", displayName: "Allen Career Institute Samyak, Landmark City, Kunhari, Kota", lat: 25.2150, lng: 75.8320, type: "coaching" },
  { id: "p-e2", name: "Allen Supath (Naya Nohar)", displayName: "Allen Career Institute Supath, Baran Road, Naya Nohar, Kota", lat: 25.1610, lng: 75.8690, type: "coaching" },
  { id: "p-e3", name: "Allen Sangyan (Rajeev Gandhi Nagar)", displayName: "Allen Career Institute Sangyan, Rajeev Gandhi Nagar, Kota", lat: 25.1590, lng: 75.8680, type: "coaching" },
  { id: "p-e4", name: "Resonance Eduventures Main Campus", displayName: "Resonance CG Tower, Rajeev Gandhi Nagar, Kota", lat: 25.1650, lng: 75.8720, type: "coaching" },
  { id: "p-e5", name: "RTU Engineering College Kota", displayName: "Rajasthan Technical University Campus, Rawatbhata Road, Kota", lat: 25.1410, lng: 75.8050, type: "university" },

  // Colonies & Hubs
  { id: "p-a1", name: "Talwandi Main Road", displayName: "Talwandi Main Road Corridor, Kota", lat: 25.1510, lng: 75.8420, type: "area" },
  { id: "p-a2", name: "Aerodrome Circle", displayName: "Aerodrome Circle, Jhalawar Road, Kota", lat: 25.1800, lng: 75.8390, type: "circle" },
  { id: "p-a3", name: "Vigyan Nagar Flyover", displayName: "Vigyan Nagar Sector 1-4, Kota", lat: 25.1810, lng: 75.8390, type: "area" },
  { id: "p-a4", name: "Mahaveer Nagar", displayName: "Mahaveer Nagar Sector 1-3, Kota", lat: 25.1680, lng: 75.8520, type: "colony" },
  { id: "p-a5", name: "Rajeev Gandhi Nagar", displayName: "Rajeev Gandhi Nagar Coaching Hub, Kota", lat: 25.1600, lng: 75.8700, type: "coaching_hub" },
  { id: "p-a6", name: "Kota Junction Railway Station", displayName: "Kota Railway Station Road, Station Area, Kota", lat: 25.2180, lng: 75.8620, type: "station" }
];

// ─── Reverse Geocoding API ───────────────────────────────────────────────────
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
      timeout: 6000
    });

    if (res.data?.display_name) {
      const addr = res.data.address || {};
      let name = addr.road || addr.suburb || addr.neighbourhood
                || addr.city_district || addr.city || res.data.display_name.split(",")[0];

      name = sanitizeToEnglish(name) || `Location (${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)})`;
      let displayName = sanitizeToEnglish(res.data.display_name) || name;

      return { name, displayName, lat: Number(lat), lng: Number(lng) };
    }
  } catch (err) {
    console.warn("Reverse geocode warning:", err.message);
  }
  return {
    name: `Location (${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)})`,
    displayName: `Coordinates: ${lat}, ${lng}`,
    lat: Number(lat), lng: Number(lng)
  };
};

// ─── Detect Physical Device Location ─────────────────────────────────────────
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

// ─── Search API: Multi-Provider Geocoding Search Engine ───────────────────────
export const searchPlacesAPI = async (query) => {
  if (!query || !query.trim()) return [];
  const q = query.trim().toLowerCase();

  // 1. Local Database Search (0ms Instant Result)
  const localMatches = KOTA_LOCAL_PLACES.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.displayName.toLowerCase().includes(q) ||
    p.type.toLowerCase().includes(q)
  );

  // 2. OpenStreetMap Nominatim & Photon Geocoding API
  let onlineResults = [];
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

    if (res.data && res.data.length > 0) {
      onlineResults = res.data.map(item => ({
        id: `nom-${item.place_id}`,
        name: sanitizeToEnglish(item.name || item.display_name.split(",")[0]),
        displayName: sanitizeToEnglish(item.display_name),
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        type: item.type || item.class,
        source: "nominatim"
      }));
    }
  } catch (err) {
    console.warn("Nominatim search warning:", err.message);
  }

  // 3. Combine local verified places + online search results
  const combined = [...localMatches];
  onlineResults.forEach(item => {
    const isDup = combined.some(c =>
      c.name.toLowerCase() === item.name.toLowerCase() ||
      (Math.abs(c.lat - item.lat) < 0.001 && Math.abs(c.lng - item.lng) < 0.001)
    );
    if (!isDup) combined.push(item);
  });

  return combined;
};

// Backward-compatibility aliases
export const searchPhoton = searchPlacesAPI;
export const searchAllLocations = searchPlacesAPI;

// ─── Driving Route API: OSRM High-Precision Driving Geometry Engine ──────────
export const getDrivingRouteAPI = async (startLat, startLng, endLat, endLng) => {
  const sLat = Number(startLat).toFixed(5);
  const sLng = Number(startLng).toFixed(5);
  const eLat = Number(endLat).toFixed(5);
  const eLng = Number(endLng).toFixed(5);

  const servers = [
    `https://routing.openstreetmap.de/routed-car/route/v1/driving/${sLng},${sLat};${eLng},${eLat}?overview=full&steps=true&geometries=geojson`,
    `https://router.project-osrm.org/route/v1/driving/${sLng},${sLat};${eLng},${eLat}?overview=full&steps=true&geometries=geojson`
  ];

  for (const url of servers) {
    try {
      const response = await axios.get(url, { timeout: 8000 });
      if (response.data && response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];

        // Convert OSRM GeoJSON [lng, lat] to Leaflet [lat, lng]
        const polylineCoords = route.geometry.coordinates.map(c => [c[1], c[0]]);
        const distanceKm = (route.distance / 1000).toFixed(1);
        const durationMin = Math.max(2, Math.round(route.duration / 60));

        // Format turn-by-turn navigation steps
        const rawSteps = route.legs?.[0]?.steps || [];
        const steps = rawSteps.map((st, i) => {
          const type = st.maneuver?.type || "straight";
          const modifier = st.maneuver?.modifier || "";
          const roadName = st.name || "Street Corridor";
          let icon = "straight";
          let instruction = `Continue on ${roadName}`;
          if (type === "depart") { icon = "depart"; instruction = `Head toward ${roadName}`; }
          else if (type === "arrive") { icon = "arrive"; instruction = `Arrive at destination: ${roadName}`; }
          else if (modifier.includes("left")) { icon = "left"; instruction = `Turn left onto ${roadName}`; }
          else if (modifier.includes("right")) { icon = "right"; instruction = `Turn right onto ${roadName}`; }

          const distMeters = Math.round(st.distance);
          const stepDistText = distMeters > 1000 ? `${(distMeters / 1000).toFixed(1)} km` : `${distMeters} m`;

          return {
            id: i + 1,
            icon,
            instruction,
            streetName: roadName,
            distance: stepDistText,
            duration: `${Math.max(1, Math.round(st.duration / 60))} min`,
            coordinates: st.geometry?.coordinates?.map(c => [c[1], c[0]]) || []
          };
        });

        return {
          coordinates: polylineCoords,
          distanceKm: `${distanceKm} km`,
          durationMin: `${durationMin} mins`,
          numericKm: parseFloat(distanceKm),
          numericMins: durationMin,
          steps
        };
      }
    } catch (err) {
      console.warn(`Route server "${url}" warning:`, err.message);
    }
  }
  return null;
};
