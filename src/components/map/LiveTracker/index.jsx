import React, { useEffect, useRef, useState } from 'react';
import { Navigation2, Clock, MapPin } from 'lucide-react';

export default function LiveTracker({ booking, height = '400px' }) {
  const mapRef      = useRef(null);
  const mapInstance = useRef(null);
  const riderMarker = useRef(null);
  const [riderPos,  setRiderPos]  = useState(null);
  const [elapsedKm, setElapsedKm] = useState(0);
  const animRef     = useRef(null);

  useEffect(() => {
   if (!mapRef.current || !window.L || !booking || mapInstance.current) return;

    const L    = window.L;
    const pick = { lat: booking.pickupLat  || 26.9124, lng: booking.pickupLng  || 75.7873 };
   const drop = (booking.stops?.[0]?.lat !== undefined && booking.stops?.[0]?.lng !== undefined)
  ? booking.stops[0]
  : { lat: 26.9855, lng: 75.8513 };

    const map = L.map(mapRef.current, {
      center: [pick.lat, pick.lng],
      zoom: 14,
      zoomControl: false,
    });
    mapInstance.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap', maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Pickup marker (gold)
    const pickupIcon = L.divIcon({
      html: `<div style="width:36px;height:36px;background:linear-gradient(135deg,#FFC15E,#E07200);border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 4px 16px rgba(245,144,0,0.5)"><svg viewBox="0 0 24 24" width="16" height="16" fill="#1A1918"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>`,
      className: '', iconSize: [36,36], iconAnchor: [18,36],
    });

    // Drop marker (green)
    const dropIcon = L.divIcon({
      html: `<div style="width:32px;height:32px;background:#16A34A;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 4px 16px rgba(22,163,74,0.5)"><svg viewBox="0 0 24 24" width="14" height="14" fill="white"><path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/></svg></div>`,
      className: '', iconSize: [32,32], iconAnchor: [16,32],
    });

    // Rider car icon (animated)
    const carIcon = L.divIcon({
      html: `<div id="rider-car" style="width:44px;height:44px;position:relative"><div style="position:absolute;inset:0;background:rgba(245,144,0,0.25);border-radius:50%" class="live-ping"></div><div style="position:absolute;inset:6px;background:linear-gradient(135deg,#FFC15E,#F59000);border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 4px 16px rgba(245,144,0,0.5)"><svg viewBox="0 0 24 24" width="16" height="16" fill="#1A1918"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg></div></div>`,
      className: '', iconSize: [44,44], iconAnchor: [22,22],
    });

    L.marker([pick.lat, pick.lng], { icon: pickupIcon })
      .bindPopup('<b style="font-family:DM Sans">Your pickup point</b>')
      .addTo(map);

    L.marker([drop.lat, drop.lng], { icon: dropIcon })
      .bindPopup('<b style="font-family:DM Sans">First stop</b>')
      .addTo(map);

    // Draw route line
    const routeLine = L.polyline(
      [[pick.lat, pick.lng], [drop.lat, drop.lng]],
      { color: '#F59000', weight: 4, opacity: 0.7, dashArray: '10, 6' }
    ).addTo(map);

    // Animated rider along route
   const startLat = booking.rider?.lat ?? (pick.lat + 0.01);
const startLng = booking.rider?.lng ?? (pick.lng - 0.01);
    riderMarker.current = L.marker([startLat, startLng], { icon: carIcon }).addTo(map);
    setRiderPos({ lat: startLat, lng: startLng });

    // Simulate movement toward pickup
    let progress = 0;
    const animate = () => {
      progress = Math.min(progress + 0.005, 1);
      const lat = startLat + (pick.lat - startLat) * progress;
      const lng = startLng + (pick.lng - startLng) * progress;
      riderMarker.current?.setLatLng([lat, lng]);
      setRiderPos({ lat, lng });
      setElapsedKm(prev => Math.min(prev + 0.02, 3.5));
      if (progress < 1) animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);

    map.fitBounds([[pick.lat, pick.lng], [startLat, startLng]], { padding: [40, 40] });

   return () => {
  cancelAnimationFrame(animRef.current);

  if (mapInstance.current) {
    mapInstance.current.remove();
    mapInstance.current = null;
  }

  riderMarker.current = null;
};
  }, [booking]);

  if (!booking) return null;

  return (
    <div className="space-y-3">
      {/* Live info bar */}
      <div className="card !p-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center">
            <Navigation2 className="w-5 h-5 text-brand-500 animate-bounce-sm" />
          </div>
          <div>
            <p className="text-xs text-ink-400 font-medium uppercase tracking-wider">Guide en route</p>
            <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">{booking.rider?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="text-center">
            <p className="text-xs text-ink-400">Arriving in</p>
            <p className="font-mono font-bold text-brand-600 dark:text-brand-400">~6 min</p>
          </div>
          <div className="h-8 w-px bg-[var(--border)]" />
          <div className="text-center">
            <p className="text-xs text-ink-400">Distance</p>
            <p className="font-mono font-bold text-ink-800 dark:text-ink-200">{elapsedKm.toFixed(1)} km</p>
          </div>
          <div className="h-8 w-px bg-[var(--border)]" />
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 live-ping" />
            <span className="text-xs font-semibold text-green-600 dark:text-green-400">LIVE</span>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="relative rounded-2xl overflow-hidden border border-[var(--border)]" style={{ height }}>
        <div ref={mapRef} className="w-full h-full" />
      </div>

      {/* Pickup address */}
      <div className="flex items-center gap-2 text-sm text-ink-600 dark:text-ink-400">
        <MapPin className="w-4 h-4 text-brand-500 flex-shrink-0" />
        <span className="truncate">{booking.pickupAddress}</span>
      </div>
    </div>
  );
}
