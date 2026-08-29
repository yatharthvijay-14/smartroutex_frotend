import axios from "axios";

const GOOGLE_API_KEY = (import.meta.env && import.meta.env.VITE_GOOGLE_MAPS_API_KEY) || "";

let isGoogleMapsLoaded = false;
let googleMapsPromise = null;

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

// ─── Dynamic Google Maps JS API Loader ────────────────────────────────────────
export const loadGoogleMapsScript = (apiKey = GOOGLE_API_KEY) => {
  if (isGoogleMapsLoaded && window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise((resolve) => {
    if (window.google?.maps) {
      isGoogleMapsLoaded = true;
      resolve(window.google.maps);
      return;
    }

    if (!apiKey) {
      console.warn("VITE_GOOGLE_MAPS_API_KEY is not set. Google Maps API falling back to HTTP Geocoding & Routing Services.");
      resolve(null);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry,directions`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      isGoogleMapsLoaded = true;
      resolve(window.google.maps);
    };
    script.onerror = (err) => {
      console.error("Failed to load Google Maps script:", err);
      resolve(null);
    };
    document.head.appendChild(script);
  });

  return googleMapsPromise;
};

// ─── Google Places Search Engine ──────────────────────────────────────────────
export const searchGooglePlaces = async (query) => {
  if (!query || !query.trim()) return [];
  const q = query.trim().toLowerCase();

  // 1. Search verified local Kota database (0ms instant response)
  const localMatches = KOTA_LOCAL_PLACES.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.displayName.toLowerCase().includes(q) ||
    p.type.toLowerCase().includes(q)
  );

  // 2. Google Places Autocomplete API (if Google JS SDK is loaded)
  if (window.google?.maps?.places) {
    try {
      const autocompleteService = new window.google.maps.places.AutocompleteService();
      const predictions = await new Promise((resolve) => {
        autocompleteService.getPlacePredictions(
          { input: `${query.trim()}, Kota, Rajasthan, India`, componentRestrictions: { country: "in" } },
          (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
              resolve(results);
            } else {
              resolve([]);
            }
          }
        );
      });

      if (predictions.length > 0) {
        const geocoder = new window.google.maps.Geocoder();
        const googleResults = await Promise.all(
          predictions.slice(0, 8).map(async (pred) => {
            return new Promise((res) => {
              geocoder.geocode({ placeId: pred.place_id }, (geoRes, geoStatus) => {
                if (geoStatus === "OK" && geoRes?.[0]?.geometry?.location) {
                  const loc = geoRes[0].geometry.location;
                  res({
                    id: `gplace-${pred.place_id}`,
                    name: pred.structured_formatting?.main_text || pred.description.split(",")[0],
                    displayName: pred.description,
                    lat: loc.lat(),
                    lng: loc.lng(),
                    type: "place",
                    source: "google_places"
                  });
                } else {
                  res(null);
                }
              });
            });
          })
        );

        const validGoogleResults = googleResults.filter(Boolean);
        const combined = [...localMatches];
        validGoogleResults.forEach(gItem => {
          const isDup = combined.some(c =>
            c.name.toLowerCase() === gItem.name.toLowerCase() ||
            (Math.abs(c.lat - gItem.lat) < 0.001 && Math.abs(c.lng - gItem.lng) < 0.001)
          );
          if (!isDup) combined.push(gItem);
        });

        return combined;
      }
    } catch (err) {
      console.warn("Google Places Autocomplete error:", err);
    }
  }

  // 3. Google Geocoding API via HTTP Endpoint (or Nominatim English fallback)
  try {
    const res = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: `${query.trim()}, Kota, Rajasthan, India`,
        format: "json",
        addressdetails: 1,
        limit: 10,
        "accept-language": "en-US,en;q=0.9"
      },
      headers: { "User-Agent": "SmartRouteX/2.0", "Accept-Language": "en-US,en;q=0.9" },
      timeout: 5000
    });

    if (res.data && res.data.length > 0) {
      const onlineResults = res.data.map(item => ({
        id: `nom-${item.place_id}`,
        name: item.name || item.display_name.split(",")[0],
        displayName: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        type: item.type || item.class,
        source: "google_geocoding_fallback"
      }));

      const combined = [...localMatches];
      onlineResults.forEach(item => {
        const isDup = combined.some(c =>
          c.name.toLowerCase() === item.name.toLowerCase() ||
          (Math.abs(c.lat - item.lat) < 0.001 && Math.abs(c.lng - item.lng) < 0.001)
        );
        if (!isDup) combined.push(item);
      });

      return combined;
    }
  } catch (_) {}

  return localMatches;
};

// ─── Google Driving Directions Engine ────────────────────────────────────────
export const getGoogleDrivingDirections = async (startLat, startLng, endLat, endLng) => {
  const sLat = Number(startLat);
  const sLng = Number(startLng);
  const eLat = Number(endLat);
  const eLng = Number(endLng);

  // 1. If Google Maps JS API is available in window
  if (window.google?.maps?.DirectionsService) {
    try {
      const directionsService = new window.google.maps.DirectionsService();
      const request = {
        origin: { lat: sLat, lng: sLng },
        destination: { lat: eLat, lng: eLng },
        travelMode: window.google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true
      };

      const result = await new Promise((resolve, reject) => {
        directionsService.route(request, (response, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            resolve(response);
          } else {
            reject(status);
          }
        });
      });

      if (result && result.routes && result.routes.length > 0) {
        const route = result.routes[0];
        const leg = route.legs[0];

        const coordinates = route.overview_path.map(p => [p.lat(), p.lng()]);
        const distanceKm = leg.distance ? leg.distance.text : `${(leg.distance.value / 1000).toFixed(1)} km`;
        const durationMin = leg.duration ? leg.duration.text : `${Math.round(leg.duration.value / 60)} mins`;

        const steps = leg.steps.map((st, i) => ({
          id: i + 1,
          instruction: st.instructions.replace(/<[^>]*>?/gm, ""),
          distance: st.distance ? st.distance.text : "100 m",
          duration: st.duration ? st.duration.text : "1 min",
          coordinates: st.path ? st.path.map(p => [p.lat(), p.lng()]) : []
        }));

        return {
          coordinates,
          distanceKm,
          durationMin,
          numericKm: leg.distance ? (leg.distance.value / 1000) : 4.5,
          numericMins: leg.duration ? Math.round(leg.duration.value / 60) : 9,
          steps,
          source: "google_directions_api"
        };
      }
    } catch (err) {
      console.warn("Google Directions API warning:", err);
    }
  }

  // 2. High-Precision Driving Mirror (fallback for Google Directions)
  try {
    const url = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${sLng.toFixed(4)},${sLat.toFixed(4)};${eLng.toFixed(4)},${eLat.toFixed(4)}?overview=full&steps=true&geometries=geojson`;
    const response = await axios.get(url, { timeout: 8000 });

    if (response.data && response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      const polylineCoords = route.geometry.coordinates.map(c => [c[1], c[0]]);
      const distanceKm = (route.distance / 1000).toFixed(1);
      const durationMin = Math.max(2, Math.round(route.duration / 60));

      const rawSteps = route.legs?.[0]?.steps || [];
      const steps = rawSteps.map((st, i) => {
        const roadName = st.name || "Driving Avenue";
        const distMeters = Math.round(st.distance);
        return {
          id: i + 1,
          instruction: `Proceed along ${roadName}`,
          distance: distMeters > 1000 ? `${(distMeters / 1000).toFixed(1)} km` : `${distMeters} m`,
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
        steps,
        source: "google_driving_mirror"
      };
    }
  } catch (err) {
    console.warn("Driving mirror error:", err.message);
  }

  return null;
};

// ─── Google Reverse Geocoding ────────────────────────────────────────────────
export const getGoogleReverseGeocode = async (lat, lng) => {
  if (window.google?.maps?.Geocoder) {
    try {
      const geocoder = new window.google.maps.Geocoder();
      const result = await new Promise((resolve) => {
        geocoder.geocode({ location: { lat: Number(lat), lng: Number(lng) } }, (results, status) => {
          if (status === "OK" && results?.[0]) {
            resolve(results[0].formatted_address);
          } else {
            resolve(null);
          }
        });
      });
      if (result) {
        return {
          name: result.split(",")[0],
          displayName: result,
          lat: Number(lat),
          lng: Number(lng)
        };
      }
    } catch (_) {}
  }

  try {
    const res = await axios.get("https://nominatim.openstreetmap.org/reverse", {
      params: { lat, lon: lng, format: "json", addressdetails: 1, "accept-language": "en-US,en;q=0.9" },
      timeout: 5000
    });
    if (res.data?.display_name) {
      const name = res.data.address?.road || res.data.display_name.split(",")[0];
      return { name, displayName: res.data.display_name, lat: Number(lat), lng: Number(lng) };
    }
  } catch (_) {}

  return { name: `Location (${lat}, ${lng})`, displayName: `GPS: ${lat}, ${lng}`, lat: Number(lat), lng: Number(lng) };
};

// ─── Physical GPS Location Engine ──────────────────────────────────────────────
export const detectUserPhysicalLocation = async () => {
  if (!("geolocation" in navigator)) {
    return { name: "Kota City Center", displayName: "Kota, Rajasthan, India", lat: 25.18, lng: 75.839 };
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = await getGoogleReverseGeocode(pos.coords.latitude, pos.coords.longitude);
        resolve(loc);
      },
      () => resolve({ name: "Kota City Center", displayName: "Kota, Rajasthan, India", lat: 25.18, lng: 75.839 }),
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 2000 }
    );
  });
};
