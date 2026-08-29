import {
  KOTA_LOCAL_PLACES,
  searchGooglePlaces,
  getGoogleDrivingDirections,
  getGoogleReverseGeocode,
  detectUserPhysicalLocation as detectUserGps,
  loadGoogleMapsScript
} from "./googleMapsService";

export { KOTA_LOCAL_PLACES, loadGoogleMapsScript };

// ─── Unified Geocoding Search Engine (Google Places API Powered) ─────────────
export const searchPlacesAPI = async (query) => {
  return await searchGooglePlaces(query);
};

export const searchPhoton = searchPlacesAPI;
export const searchAllLocations = searchPlacesAPI;

// ─── Unified Driving Directions Engine (Google Driving Directions Powered) ───
export const getDrivingRouteAPI = async (startLat, startLng, endLat, endLng) => {
  return await getGoogleDrivingDirections(startLat, startLng, endLat, endLng);
};

export const fetchOSRMRoute = getDrivingRouteAPI;

// ─── Reverse Geocoding API (Google Geocoder Powered) ──────────────────────────
export const reverseGeocodeLocation = async (lat, lng) => {
  return await getGoogleReverseGeocode(lat, lng);
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
