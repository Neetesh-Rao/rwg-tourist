import React, { useEffect, useRef, useState } from 'react';
import { Navigation2, MapPin } from 'lucide-react';
import { getTouristSocket } from '@/socket/socket';

export default function LiveTracker({ booking, height = '400px' }) {
  const mapRef      = useRef(null);
  const mapInstance = useRef(null);
  const riderMarker = useRef(null);
  const [elapsedKm, setElapsedKm] = useState(0);

  useEffect(() => {
    if (!mapRef.current || !window.L || !booking || mapInstance.current) return;

    const L    = window.L;
    const pick = { lat: booking.pickupLat || 28.6139, lng: booking.pickupLng || 77.2090 }; // Default to Delhi

    // 1. Initialize Map
    const map = L.map(mapRef.current, {
      center: [pick.lat, pick.lng],
      zoom: 12,
      zoomControl: false,
    });
    mapInstance.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap', maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // 2. Icons
    const pickupIcon = L.divIcon({
      html: `<div style="width:36px;height:36px;background:linear-gradient(135deg,#FFC15E,#E07200);border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 4px 16px rgba(245,144,0,0.5)"><svg viewBox="0 0 24 24" width="16" height="16" fill="#1A1918"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>`,
      className: '', iconSize: [36,36], iconAnchor: [18,36],
    });

    const carIcon = L.divIcon({
      html: `<div id="rider-car" style="width:44px;height:44px;position:relative"><div style="position:absolute;inset:0;background:rgba(245,144,0,0.25);border-radius:50%" class="live-ping"></div><div style="position:absolute;inset:6px;background:linear-gradient(135deg,#FFC15E,#F59000);border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 4px 16px rgba(245,144,0,0.5)"><svg viewBox="0 0 24 24" width="16" height="16" fill="#1A1918"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg></div></div>`,
      className: '', iconSize: [44,44], iconAnchor: [22,22],
    });

    console.log("📍 TRIP STOPS DATA:", booking.stops);

    const pathPoints = [[pick.lat, pick.lng]];

    if (booking.stops && booking.stops.length > 0) {
      booking.stops.forEach((stop, index) => {
        const sLat = stop.location?.lat || stop.lat;
        const sLng = stop.location?.lng || stop.lng;
        
        console.log(`Stop ${index + 1} coords:`, sLat, sLng);

        if (sLat && sLng) {
          const stopIcon = L.divIcon({
            html: `<div style="width:32px;height:32px;background:#16A34A;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 4px 16px rgba(22,163,74,0.5)"><span style="color:white;font-weight:bold;font-size:12px">${index + 1}</span></div>`,
            className: '', iconSize: [32,32], iconAnchor: [16,32],
          });
          L.marker([sLat, sLng], { icon: stopIcon }).bindPopup(`<b>Stop ${index + 1}: ${stop.name || ''}</b>`).addTo(map);
          pathPoints.push([sLat, sLng]);
        }
      });
    }

    if (pathPoints.length > 1) {
      L.polyline(pathPoints, {
        color: '#F59000', weight: 4, opacity: 0.7, dashArray: '10, 6'
      }).addTo(map);
    }

    // Auto-center to see the whole route
    if (pathPoints.length > 0) {
      map.fitBounds(pathPoints, { padding: [50, 50] });
    }

    // 4. Rider Marker
    const initialLat = booking.liveLocation?.lat || booking.rider?.lat || pick.lat;
    const initialLng = booking.liveLocation?.lng || booking.rider?.lng || pick.lng;
    riderMarker.current = L.marker([initialLat, initialLng], { icon: carIcon }).addTo(map);

    const socket = getTouristSocket();
    const bId = booking.id || booking._id;

    // 6. Tourist's Own Location (Blue Dot)
    let touristWatcher = null;
    const touristMarkerIcon = L.divIcon({
      html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg ring-4 ring-blue-500/20"></div>`,
      className: '', iconSize: [16, 16], iconAnchor: [8, 8]
    });
    const tMarker = L.marker([pick.lat, pick.lng], { icon: touristMarkerIcon }).addTo(map);

    if (navigator.geolocation) {
      touristWatcher = navigator.geolocation.watchPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        tMarker.setLatLng([latitude, longitude]);
        
        // Auto-zoom to fit both
        if (mapInstance.current && riderMarker.current) {
          const bounds = L.latLngBounds([latitude, longitude], riderMarker.current.getLatLng());
          mapInstance.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
        }

        if (socket && bId) {
          socket.emit("update-tourist-location", { bookingId: bId, lat: latitude, lng: longitude });
        }
      }, null, { enableHighAccuracy: true });
    }

    if (socket && bId) {
      socket.emit("join-ride", bId);

      socket.on("ride-location-updated", (data) => {
        if (!data.lat || !data.lng) return;
        if (riderMarker.current) {
          riderMarker.current.setLatLng([data.lat, data.lng]);
          
          // Auto-zoom to fit both
          if (mapInstance.current && tMarker) {
            const bounds = L.latLngBounds([data.lat, data.lng], tMarker.getLatLng());
            mapInstance.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
          }

          setElapsedKm(prev => prev + 0.01);
        }
      });
    }

    if (pathPoints.length > 0) {
      map.fitBounds(pathPoints, { padding: [40, 40] });
    }

    // 7. Consolidated Cleanup
    return () => {
      if (touristWatcher) navigator.geolocation.clearWatch(touristWatcher);
      if (socket) {
        socket.emit("leave-ride", bId);
        socket.off("ride-location-updated");
      }
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
            <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">{booking.rider?.name || 'Your Guide'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="text-center">
            <p className="text-xs text-ink-400">Status</p>
            <p className="font-mono font-bold text-brand-600 dark:text-brand-400">Live</p>
          </div>
          <div className="h-8 w-px bg-[var(--border)]" />
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 live-ping" />
            <span className="text-xs font-semibold text-green-600 dark:text-green-400">LIVE TRACKING</span>
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
