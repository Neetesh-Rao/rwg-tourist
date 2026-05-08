export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9999/api';

export let GLOBAL_RATES = null;
export let CITIES = [];
export let DISTANCE_DEFAULTS = {};
export let PRICING_CONFIG = null;
export let RIDE_TYPES = [];
export let LANGUAGES = [];
export let NATIONALITIES = [];
export let PAYMENT_METHODS = [];
export let UPI_APPS = [];
export let BOOKING_STATUS = {};
export let CITY_STOPS = {};

export const getCityById = id => CITIES.find(c => c.id === id) || CITIES[0];

export const initPlatformConfig = async () => {
  try {
    const res = await fetch(`${API_URL}/config`);
    const json = await res.json();
    const data = json.data;

    if (data) {
      if (data.GLOBAL_RATES) GLOBAL_RATES = data.GLOBAL_RATES;
      if (data.CITIES) CITIES = data.CITIES;
      if (data.DISTANCE_DEFAULTS) DISTANCE_DEFAULTS = data.DISTANCE_DEFAULTS;
      if (data.PRICING_CONFIG) PRICING_CONFIG = data.PRICING_CONFIG;
      if (data.RIDE_TYPES) RIDE_TYPES = data.RIDE_TYPES;
      if (data.LANGUAGES) LANGUAGES = data.LANGUAGES;
      if (data.NATIONALITIES) NATIONALITIES = data.NATIONALITIES;
      if (data.PAYMENT_METHODS) PAYMENT_METHODS = data.PAYMENT_METHODS;
      if (data.UPI_APPS) UPI_APPS = data.UPI_APPS;
      if (data.BOOKING_STATUS) BOOKING_STATUS = data.BOOKING_STATUS;
      if (data.CITY_STOPS) CITY_STOPS = data.CITY_STOPS;
      console.log("✅ Platform Configuration Loaded from DB");
    }
  } catch (err) {
    console.warn("⚠️ Using static fallback config:", err.message);
  }
};

