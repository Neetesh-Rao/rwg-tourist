import { DISTANCE_DEFAULTS, PRICING_CONFIG, GLOBAL_RATES } from '../config/constants';

export const genId=(p='id')=>`${p}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
export const sleep=ms=>new Promise(r=>setTimeout(r,ms));

export const playNotificationSound = () => {
  try {
    const audio = new Audio('/Notification.mp3');
    audio.play().catch(e => console.warn("Audio play blocked:", e));
  } catch (err) {
    console.warn("Failed to play notification sound:", err);
  }
};


export const ls={
  get:(k,fb=null)=>{try{const v=localStorage.getItem(k);return v!==null?JSON.parse(v):fb;}catch{return fb;}},
  set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}},
  remove:k=>{try{localStorage.removeItem(k);}catch{}},
};

export const formatINR=n=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n||0);
export const formatDate=(s,opts={})=>{if(!s)return '';try{return new Date(s).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric',...opts});}catch{return s;}};
export const formatTime=s=>{if(!s)return '';try{const[h,m]=s.split(':');const hr=parseInt(h,10);return `${hr>12?hr-12:hr||12}:${m} ${hr>=12?'PM':'AM'}`;}catch{return s;}};
export const getTomorrow=()=>{const d=new Date();d.setDate(d.getDate()+1);return d.toISOString().split('T')[0];};

export const isValidPhone=v=>/^[6-9]\d{9}$/.test(v);

// Calculates distance between two points in KM
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

// Calculates total route distance (Pickup -> Stop 1 -> Stop 2 ...) with breakdown
export const calculateRouteDistance = (pickup, stops = [], config = null) => {
  const roadFactor = config?.PRICING_CONFIG?.ROAD_FACTOR || PRICING_CONFIG.ROAD_FACTOR;
  if (!stops || stops.length === 0) return { total: 0, segments: [] };
  
  let total = 0;
  let segments = [];
  let lastPoint = null;
  let lastLabel = "Pickup";

  // 1. Try to start from pickup
  if (pickup?.lat && pickup?.lng) {
    lastPoint = { lat: pickup.lat, lng: pickup.lng };
    lastLabel = "Pickup";
  } else {
    // 2. If no pickup coords, start from the first stop
    const firstStop = stops[0];
    const fLat = firstStop.location?.lat || firstStop.lat;
    const fLng = firstStop.location?.lng || firstStop.lng;
    if (fLat && fLng) {
      lastPoint = { lat: fLat, lng: fLng };
      lastLabel = firstStop.name;
    }
  }

  if (!lastPoint) return { total: 0, segments: [] };

  stops.forEach((stop, index) => {
    // If we started from the first stop, skip the first calculation
    if (index === 0 && (!pickup?.lat || !pickup?.lng)) return;

    const stopLat = stop.location?.lat || stop.lat;
    const stopLng = stop.location?.lng || stop.lng;
    
    if (stopLat && stopLng) {
      const dist = calculateDistance(lastPoint.lat, lastPoint.lng, stopLat, stopLng);
      const roadDist = parseFloat((dist * roadFactor).toFixed(1)); // Use factor from config
      
      segments.push({
        from: lastLabel,
        to: stop.name,
        distance: roadDist
      });

      total += roadDist;
      lastPoint = { lat: stopLat, lng: stopLng };
      lastLabel = stop.name;
    }
  });

  return { 
    total: parseFloat(total.toFixed(1)), 
    segments,
    roadFactorApplied: roadFactor
  };
};

export const calcEstimate=({city, rideTypeId, hoursBooked=5, actualKm=0, segments=[], config=null})=>{
  if(!city)return null;

  const rates = config?.GLOBAL_RATES || GLOBAL_RATES;
  const distDefaults = config?.DISTANCE_DEFAULTS || DISTANCE_DEFAULTS;
  const pConfig = config?.PRICING_CONFIG || PRICING_CONFIG;

  const estimatedKm = distDefaults[rideTypeId] || distDefaults.default || 30;
  const km = actualKm > 0 ? actualKm : estimatedKm;
  
  const base = rates.base;
  const dist = Math.round(km * rates.perKm);
  const time = Math.round((hoursBooked || 5) * rates.perHour);
  const guide = rates.guideFee;
  const d = city.demand || 1.0;
  
  // Calculate specific categories
  const rawTotal = Math.round((dist + time + base + guide) * d);
  
  // Admin Commission Percent (Default 30%)
  const adminPercent = pConfig.ADMIN_COMMISSION_PERCENT !== undefined ? pConfig.ADMIN_COMMISSION_PERCENT : 0.3;
  
  const serviceFee = Math.round(rawTotal * adminPercent); // Admin Share
  const rideFee = rawTotal - serviceFee; // Rider Share
  const total = rawTotal; // Total Tourist Pays

  return {
    baseFare: base,
    distanceCharge: dist,
    timeCharge: time,
    guideFee: guide,
    rideFee,
    serviceFee,
    totalFee: total,
    totalDistance: km,
    distanceSegments: segments,
    demandMult: d,
    advanceAmount: Math.round(total * pConfig.ADVANCE_PERCENT),
    calculationMethod: {
      formula: pConfig.FORMULA,
      description: pConfig.DESCRIPTION,
      roadFactor: pConfig.ROAD_FACTOR,
      adminCommission: adminPercent,
      isRealRoute: actualKm > 0
    }
  };
};


