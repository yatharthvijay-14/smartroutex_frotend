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

// Helper: Flexible Fuzzy Matcher for place names (handles spelling variations like godavri/godavari, rajiv/rajeev, mahavir/mahaveer)
function fuzzyMatch(str, query) {
  if (!str || !query) return false;
  const s = str.toLowerCase().replace(/[^a-z0-9]/g, "");
  const q = query.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (s.includes(q)) return true;

  // Replace common phonetic equivalents: 'ri' / 'vari', 'ae' / 'e', 'v' / 'w', 'ee' / 'i'
  const normS = s.replace(/v/g, "w").replace(/ee/g, "i").replace(/aa/g, "a").replace(/ari/g, "ri").replace(/vari/g, "vri");
  const normQ = q.replace(/v/g, "w").replace(/ee/g, "i").replace(/aa/g, "a").replace(/ari/g, "ri").replace(/vari/g, "vri");
  return normS.includes(normQ);
}

// ─── Comprehensive Local Database of Kota Locations (Cafes, Temples, Hospitals, Coaching, Malls) ───
export const KOTA_LOCATIONS = [
  // ── TEMPLE / MANDIR ──
  { id: "k-t3", name: "Godavari Dham Hanuman Temple", displayName: "Godavari Dham Hanuman Mandir, Chambal River Bank, Kota", lat: 25.1780, lng: 75.8150, type: "temple", aliases: ["godavri", "godawari", "hanuman mandir"] },
  { id: "k-t1", name: "Khade Ganesh Ji Temple", displayName: "Khade Ganesh Ji Temple, Ganesh Nagar, Kota", lat: 25.1320, lng: 75.8340, type: "temple", aliases: ["ganesh mandir", "khade ganesh"] },
  { id: "k-t2", name: "Karneshwar Mahadev Temple", displayName: "Karneshwar Mahadev Temple, Rawatbhata Road, Kota", lat: 25.1450, lng: 75.8210, type: "temple", aliases: ["karneshwar", "mahadev mandir"] },
  { id: "k-t4", name: "Garadia Mahadev Temple", displayName: "Garadia Mahadev Canyon Temple, Chambal Gorge, Kota", lat: 25.0750, lng: 75.6980, type: "temple", aliases: ["garadia", "chambal gorge"] },
  { id: "k-t5", name: "Mathuradheesh Temple Rampura", displayName: "Mathuradheesh Ji Temple, Old City Rampura, Kota", lat: 25.1870, lng: 75.8440, type: "temple", aliases: ["mathuradheesh"] },
  { id: "k-t6", name: "Radha Krishna Temple Talwandi", displayName: "Radha Krishna Mandir, Talwandi Sector A, Kota", lat: 25.1530, lng: 75.8410, type: "temple", aliases: ["talwandi mandir"] },
  { id: "k-t7", name: "Shiv Puri Temple Dadabari", displayName: "Shiv Puri Mandir, Dadabari Main Road, Kota", lat: 25.1610, lng: 75.8320, type: "temple", aliases: ["dadabari shiv mandir"] },
  { id: "k-t8", name: "Jain Temple Mahaveer Nagar", displayName: "Shri Digambar Jain Temple, Mahaveer Nagar 2, Kota", lat: 25.1690, lng: 75.8510, type: "temple", aliases: ["jain mandir"] },

  // ── HOSPITALS & CLINICS ──
  { id: "k-h1", name: "MBS Hospital (Maharao Bhim Singh)", displayName: "MBS Government Hospital, Nayapura Road, Kota", lat: 25.1840, lng: 75.8420, type: "hospital", aliases: ["mbs", "bhim singh hospital"] },
  { id: "k-h2", name: "New Medical College Hospital Kota", displayName: "Government New Medical College Hospital, Rangbari Road, Kota", lat: 25.1480, lng: 75.8280, type: "hospital", aliases: ["medical college hospital", "new medical hospital"] },
  { id: "k-h3", name: "JK Lon Hospital Kota", displayName: "JK Lon Mother & Child Hospital, Nayapura, Kota", lat: 25.1830, lng: 75.8430, type: "hospital", aliases: ["jk lon"] },
  { id: "k-h4", name: "Jay Kay Hospital Talwandi", displayName: "Jay Kay Multispeciality Hospital, Talwandi, Kota", lat: 25.1540, lng: 75.8440, type: "hospital", aliases: ["jk hospital"] },
  { id: "k-h5", name: "Sudha Hospital Mahaveer Nagar", displayName: "Sudha Hospital & Medical Research Centre, Mahaveer Nagar 1, Kota", lat: 25.1680, lng: 75.8520, type: "hospital", aliases: ["sudha hospital"] },
  { id: "k-h6", name: "Bharat Vikas Parishad Hospital", displayName: "Bharat Vikas Parishad Hospital, Dadabari, Kota", lat: 25.1630, lng: 75.8350, type: "hospital", aliases: ["bvp hospital"] },
  { id: "k-h7", name: "Maitri Hospital Vigyan Nagar", displayName: "Maitri Hospital, Vigyan Nagar Sector 2, Kota", lat: 25.1790, lng: 75.8410, type: "hospital", aliases: ["maitri hospital"] },
  { id: "k-h8", name: "Kota Heart Institute", displayName: "Kota Heart Institute, Jhalawar Road, Kota", lat: 25.1660, lng: 75.8510, type: "hospital", aliases: ["heart hospital"] },

  // ── CAFES, RESTAURANTS & FOOD ──
  { id: "k-c1", name: "The Brew Room Cafe Talwandi", displayName: "The Brew Room Cafe, Talwandi Main Road, Kota", lat: 25.1525, lng: 75.8425, type: "cafe", aliases: ["brew room"] },
  { id: "k-c2", name: "Cafe Coffee Day Jhalawar Road", displayName: "CCD, Near City Mall, Jhalawar Road, Kota", lat: 25.1710, lng: 75.8510, type: "cafe", aliases: ["ccd"] },
  { id: "k-c3", name: "Kota Tea Bar & Cafe Rajeev Gandhi Nagar", displayName: "Kota Tea Bar & Cafe, Rajeev Gandhi Nagar, Kota", lat: 25.1605, lng: 75.8705, type: "cafe", aliases: ["tea bar"] },
  { id: "k-c4", name: "Seven Wonders Lake View Cafe", displayName: "7 Wonders Promenade Cafe, Kishore Sagar Lake, Kota", lat: 25.1735, lng: 75.8412, type: "cafe", aliases: ["lake view cafe"] },
  { id: "k-c5", name: "McDonald's City Mall Kota", displayName: "McDonald's, Ground Floor, City Mall, Kota", lat: 25.1635, lng: 75.8525, type: "restaurant", aliases: ["mcdonalds", "mcd"] },
  { id: "k-c6", name: "Domino's Pizza Talwandi", displayName: "Domino's Pizza, Talwandi Sector A, Kota", lat: 25.1518, lng: 75.8422, type: "restaurant", aliases: ["dominos"] },
  { id: "k-c7", name: "Domino's Pizza Rajeev Gandhi Nagar", displayName: "Domino's Pizza, Coaching Hub, Rajeev Gandhi Nagar, Kota", lat: 25.1610, lng: 75.8700, type: "restaurant", aliases: ["dominos"] },
  { id: "k-c8", name: "Barbeque Nation City Mall", displayName: "Barbeque Nation, 3rd Floor City Mall, Kota", lat: 25.1632, lng: 75.8522, type: "restaurant", aliases: ["barbeque nation"] },
  { id: "k-c9", name: "Amar Punjabi Dhaba Aerodrome", displayName: "Amar Punjabi Dhaba, Aerodrome Circle, Kota", lat: 25.1795, lng: 75.8395, type: "restaurant", aliases: ["amar punjabi"] },
  { id: "k-c10", name: "Swagat Restaurant Gumanpura", displayName: "Swagat Restaurant, Shopping Centre, Gumanpura, Kota", lat: 25.1785, lng: 75.8485, type: "restaurant", aliases: ["swagat"] },
  { id: "k-c11", name: "Rolls Mania Rajeev Gandhi Nagar", displayName: "Rolls Mania, Rajeev Gandhi Nagar, Kota", lat: 25.1602, lng: 75.8702, type: "cafe", aliases: ["rolls mania"] },
  { id: "k-c12", name: "Tea Connect Cafe Mahaveer Nagar", displayName: "Tea Connect Cafe, Mahaveer Nagar 2, Kota", lat: 25.1685, lng: 75.8515, type: "cafe", aliases: ["tea connect"] },

  // ── COACHING INSTITUTES & UNIVERSITIES ──
  { id: "k-ed1", name: "Allen Samyak (Landmark City)", displayName: "Allen Career Institute Samyak, Landmark City, Kunhari, Kota", lat: 25.2150, lng: 75.8320, type: "coaching", aliases: ["allen landmark", "allen samyak"] },
  { id: "k-ed2", name: "Allen Supath (Naya Nohar)", displayName: "Allen Career Institute Supath, Baran Road, Naya Nohar, Kota", lat: 25.1610, lng: 75.8690, type: "coaching", aliases: ["allen supath"] },
  { id: "k-ed3", name: "Allen Sangyan (Rajeev Gandhi Nagar)", displayName: "Allen Career Institute Sangyan, Rajeev Gandhi Nagar, Kota", lat: 25.1590, lng: 75.8680, type: "coaching", aliases: ["allen sangyan"] },
  { id: "k-ed4", name: "Allen Sankalp (Indraprastha)", displayName: "Allen Career Institute Sankalp, IPIA, Kota", lat: 25.1720, lng: 75.8490, type: "coaching", aliases: ["allen sankalp"] },
  { id: "k-ed5", name: "Resonance Eduventures Main Campus", displayName: "Resonance CG Tower, Rajeev Gandhi Nagar, Kota", lat: 25.1650, lng: 75.8720, type: "coaching", aliases: ["resonance"] },
  { id: "k-ed6", name: "Reliable Institute Rajeev Gandhi Nagar", displayName: "Reliable Institute Campus, Rajeev Gandhi Nagar, Kota", lat: 25.1605, lng: 75.8695, type: "coaching", aliases: ["reliable"] },
  { id: "k-ed7", name: "Motion Education Campus", displayName: "Motion Education 360 Campus, Rajeev Gandhi Nagar, Kota", lat: 25.1620, lng: 75.8710, type: "coaching", aliases: ["motion"] },
  { id: "k-ed8", name: "Physics Wallah Vidyapeeth Kota", displayName: "PW Vidyapeeth Offline Center, Rajeev Gandhi Nagar, Kota", lat: 25.1615, lng: 75.8698, type: "coaching", aliases: ["pw", "vidyapeeth"] },
  { id: "k-ed9", name: "Unacademy Centre Kota", displayName: "Unacademy Offline Center, Road No 1, IPIA, Kota", lat: 25.1625, lng: 75.8705, type: "coaching", aliases: ["unacademy"] },
  { id: "k-ed10", name: "Career Point University Campus", displayName: "Career Point University City Office, IPIA, Kota", lat: 25.1430, lng: 75.8740, type: "university", aliases: ["cp", "career point"] },
  { id: "k-ed11", name: "Bansal Classes Tower", displayName: "Bansal Classes Tower, Road No 1, IPIA, Kota", lat: 25.1740, lng: 75.8480, type: "coaching", aliases: ["bansal"] },
  { id: "k-ed12", name: "Engineering College (RTU Kota)", displayName: "Rajasthan Technical University Campus, Rawatbhata Road, Kota", lat: 25.1410, lng: 75.8050, type: "university", aliases: ["rtu", "engineering college"] },

  // ── SECTORS & COLONIES ──
  { id: "kota-1", name: "Talwandi Main Road", displayName: "Talwandi Main Road, Kota, Rajasthan", lat: 25.1510, lng: 75.8420, type: "area", aliases: ["talwandi"] },
  { id: "kota-2", name: "Talwandi Circle", displayName: "Talwandi Circle, Sector A, Kota", lat: 25.1520, lng: 75.8430, type: "junction", aliases: ["talwandi circle"] },
  { id: "kota-3", name: "Aerodrome Circle", displayName: "Aerodrome Circle, Jhalawar Road, Kota", lat: 25.1800, lng: 75.8390, type: "circle", aliases: ["aerodrome", "aerodrum"] },
  { id: "kota-4", name: "Jhalawar Road Expressway", displayName: "Jhalawar Road Corridor, Kota", lat: 25.2138, lng: 75.8648, type: "highway", aliases: ["jhalawar road"] },
  { id: "kota-5", name: "Vigyan Nagar Flyover", displayName: "Vigyan Nagar Flyover, Kota", lat: 25.1810, lng: 75.8390, type: "flyover", aliases: ["vigyan nagar", "vigan nagar"] },
  { id: "kota-6", name: "Vigyan Nagar Main Market", displayName: "Vigyan Nagar Sector 1-4, Kota", lat: 25.1780, lng: 75.8420, type: "market", aliases: ["vigyan nagar market"] },
  { id: "kota-7", name: "Mahaveer Nagar 1", displayName: "Mahaveer Nagar Extension 1, Kota", lat: 25.1700, lng: 75.8500, type: "colony", aliases: ["mahaveer nagar", "mahavir nagar"] },
  { id: "kota-8", name: "Mahaveer Nagar 2", displayName: "Mahaveer Nagar Sector 2, Kota", lat: 25.1680, lng: 75.8530, type: "colony", aliases: ["mahaveer nagar 2"] },
  { id: "kota-9", name: "Mahaveer Nagar 3", displayName: "Mahaveer Nagar Sector 3, Kota", lat: 25.1650, lng: 75.8550, type: "colony", aliases: ["mahaveer nagar 3"] },
  { id: "kota-10", name: "Rajeev Gandhi Nagar", displayName: "Rajeev Gandhi Nagar Coaching Hub, Kota", lat: 25.1600, lng: 75.8700, type: "coaching_hub", aliases: ["rajeev gandhi", "rajiv gandhi"] },
  { id: "kota-15", name: "Dadabari Choraaha", displayName: "Dadabari Main Choraaha, Kota", lat: 25.1620, lng: 75.8330, type: "junction", aliases: ["dadabari"] },
  { id: "kota-16", name: "Dadabari Main Market", displayName: "Dadabari Sector 1-7, Kota", lat: 25.1610, lng: 75.8340, type: "market", aliases: ["dadabari market"] },
  { id: "kota-17", name: "Kota Junction Railway Station", displayName: "Kota Railway Station Road, Station Area", lat: 25.2180, lng: 75.8620, type: "station", aliases: ["station", "kota junction"] },
  { id: "kota-18", name: "Nayapura Heritage Gate", displayName: "Nayapura Gate & Heritage Road, Kota", lat: 25.1820, lng: 75.8400, type: "heritage", aliases: ["nayapura", "nayapora"] },
  { id: "kota-19", name: "Nayapura Bus Stand", displayName: "Interstate Bus Terminal, Nayapura, Kota", lat: 25.1850, lng: 75.8410, type: "bus_stand", aliases: ["bus stand"] },

  // ── MALLS, CINEMAS & PARKS ──
  { id: "k-m1", name: "City Mall Kota", displayName: "City Mall, Jhalawar Road (Opposite City Park), Kota", lat: 25.1488, lng: 75.8524, type: "mall", aliases: ["city mall", "mall"] },
  { id: "k-m2", name: "Fun Cinema City Mall Kota", displayName: "Fun Cinema, Top Floor City Mall, Kota", lat: 25.1489, lng: 75.8525, type: "cinema", aliases: ["fun cinema"] },
  { id: "k-m3", name: "Inox Cinema Motion Mall", displayName: "Inox Multiplex, Motion Mall, Jhalawar Road, Kota", lat: 25.1550, lng: 75.8510, type: "cinema", aliases: ["inox cinema"] },
  { id: "kota-20", name: "Seven Wonders Park", displayName: "Kishore Sagar Lake Promenade, Kota", lat: 25.1730, lng: 75.8410, type: "park", aliases: ["7 wonders", "seven wonders"] },
  { id: "kota-21", name: "Kishore Sagar Lake", displayName: "Jagmandir Palace & Lake, Kota", lat: 25.1750, lng: 75.8430, type: "lake", aliases: ["kishore sagar"] },
  { id: "k-p1", name: "Chambal Garden", displayName: "Chambal Garden Park, Chambal River Bank, Kota", lat: 25.1550, lng: 75.8180, type: "park", aliases: ["chambal garden"] },
  { id: "k-p2", name: "Oxyzone City Park Kota", displayName: "Oxyzone City Park (Opposite City Mall), Jhalawar Road, Kota", lat: 25.1492, lng: 75.8505, type: "park", aliases: ["city park", "oxyzone park", "kanwal garden"] },
  { id: "kota-28", name: "Chawani Choraaha", displayName: "Chawani Circle, Kota", lat: 25.1760, lng: 75.8510, type: "junction", aliases: ["chawani"] },
  { id: "kota-29", name: "Borkheda Flyover", displayName: "Baran Road, Borkheda, Kota", lat: 25.1920, lng: 75.8810, type: "flyover", aliases: ["borkheda"] },
  { id: "kota-30", name: "Kunhari Choraaha", displayName: "Bundi Road, Kunhari, Kota", lat: 25.2050, lng: 75.8350, type: "junction", aliases: ["kunhari"] },
  { id: "kota-31", name: "Sakatpura Dam", displayName: "Kota Barrage Dam & Sakatpura, Kota", lat: 25.1950, lng: 75.8100, type: "dam", aliases: ["barrage dam"] },
  { id: "kota-32", name: "Shrinath Puram Stadium", displayName: "Shrinath Puram Sports Complex, Kota", lat: 25.1580, lng: 75.8250, type: "stadium", aliases: ["stadium"] },
  { id: "kota-33", name: "RK Puram Sector A/B", displayName: "Radhakrishnan Puram, Kota", lat: 25.1530, lng: 75.8210, type: "colony", aliases: ["rk puram"] },
  { id: "kota-34", name: "Indraprastha Industrial Area", displayName: "IPIA Sector 1-5, Kota", lat: 25.1420, lng: 75.8750, type: "industrial", aliases: ["ipia"] },
  { id: "kota-35", name: "DCM Circle", displayName: "DCM Road Junction, Kota", lat: 25.1400, lng: 75.8700, type: "junction", aliases: ["dcm"] },
  { id: "kota-36", name: "Ranpur Industrial Zone", displayName: "RIICO Industrial Area, Ranpur, Kota", lat: 25.0950, lng: 75.8550, type: "industrial", aliases: ["ranpur"] }
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
        limit: 10,
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
        limit: 12,
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

// ─── Unified All-Location Search Engine (Small & Big Locations, Cafes, Mandir, Hospitals) ───
export const searchAllLocations = async (query) => {
  if (!query || !query.trim()) return [];
  const q = query.trim().toLowerCase();

  // 1. Instant Fuzzy Match in Local Kota Database (Cafes, Mandir, Hospitals, Coaching, Sectors)
  const localMatches = KOTA_LOCATIONS.filter(item =>
    fuzzyMatch(item.name, q) ||
    fuzzyMatch(item.displayName, q) ||
    fuzzyMatch(item.type, q) ||
    (item.aliases && item.aliases.some(alias => fuzzyMatch(alias, q)))
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

  // Prioritize Kota results in online items so out-of-state items don't jump ahead
  onlineResults.sort((a, b) => {
    const aIsKota = a.displayName?.toLowerCase().includes("kota");
    const bIsKota = b.displayName?.toLowerCase().includes("kota");
    if (aIsKota && !bIsKota) return -1;
    if (!aIsKota && bIsKota) return 1;
    return 0;
  });

  // 3. Combine with Local Kota matches ALWAYS on TOP
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
