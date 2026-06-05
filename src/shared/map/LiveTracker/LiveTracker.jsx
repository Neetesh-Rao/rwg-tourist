import React, { useEffect, useRef, useState } from 'react';
import { Navigation2, MapPin } from 'lucide-react';
import { getTouristSocket } from '@/socket/socket';

// Smooth marker animation using requestAnimationFrame
function slideMarkerTo(marker, targetLatLng, duration = 1500) {
  if (!marker) return;
  const start     = marker.getLatLng();
  const startTime = performance.now();
  const dlat      = targetLatLng[0] - start.lat;
  const dlng      = targetLatLng[1] - start.lng;

  function step(now) {
    const elapsed = now - startTime;
    const t       = Math.min(elapsed / duration, 1);
    const ease    = 1 - Math.pow(1 - t, 3); // ease-out cubic
    marker.setLatLng([start.lat + dlat * ease, start.lng + dlng * ease]);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// Fetch OSRM road route and return decoded coords
async function fetchOSRMRoute(fromLat, fromLng, toLat, toLng) {
  const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
  try {
    const res  = await fetch(url);
    const data = await res.json();
    if (data.routes?.[0]) {
      return data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
    }
  } catch (_) { /* fall through */ }
  return null; // caller handles fallback
}

export default function LiveTracker({ booking, height = '400px' }) {
  const mapRef        = useRef(null);
  const mapInstance   = useRef(null);
  const riderMarker   = useRef(null);
  const routeLine     = useRef(null);          // current orange polyline
  const lastRiderPos  = useRef(null);          // {lat,lng} of last OSRM request
  const [elapsedKm, setElapsedKm] = useState(0);

  // ── Helper: remove existing orange line ──────────────────────────────
  function clearRoute(map) {
    if (routeLine.current && map) {
      map.removeLayer(routeLine.current);
      routeLine.current = null;
    }
  }

  // ── Helper: draw route rider → pickup via OSRM ───────────────────────
  async function drawRiderToPickup(map, rLat, rLng, pLat, pLng) {
    if (!map) return;
    clearRoute(map);

    const L      = window.L;
    const coords = await fetchOSRMRoute(rLat, rLng, pLat, pLng);

    if (!mapInstance.current) return; // unmounted while fetching

    if (coords) {
      routeLine.current = L.polyline(coords, {
        color: '#F59000', weight: 5, opacity: 0.9,
      }).addTo(map);
    } else {
      // Fallback — dashed straight line
      routeLine.current = L.polyline([[rLat, rLng], [pLat, pLng]], {
        color: '#F59000', weight: 4, opacity: 0.7, dashArray: '10, 6',
      }).addTo(map);
    }

    // Fit map to show full route
    if (routeLine.current) {
      map.fitBounds(routeLine.current.getBounds(), { padding: [50, 50], maxZoom: 16 });
    }

    lastRiderPos.current = { lat: rLat, lng: rLng };
  }

  // ── Main effect: initialise map & socket listeners ───────────────────
  useEffect(() => {
    if (!mapRef.current || !window.L || !booking || mapInstance.current) return;

    const L = window.L;

    const pick = {
      lat: Number(booking.pickupLat || booking.pickupLocation?.lat || 28.6139),
      lng: Number(booking.pickupLng || booking.pickupLocation?.lng || 77.2090),
    };

    // ── 1. Create Map ─────────────────────────────────────────────────
    const map = L.map(mapRef.current, {
      center: [pick.lat, pick.lng],
      zoom: 13,
      zoomControl: false,
    });
    mapInstance.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap', maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // ── 2. Icon Definitions ───────────────────────────────────────────
    const pickupIcon = L.divIcon({
      html: `<div style="width:36px;height:36px;background:linear-gradient(135deg,#FFC15E,#E07200);border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 4px 16px rgba(245,144,0,0.5)"><svg viewBox="0 0 24 24" width="16" height="16" fill="#1A1918"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>`,
      className: '', iconSize: [36, 36], iconAnchor: [18, 36],
    });

    const carIcon = L.divIcon({
      html: `<div id="rider-car" style="width:44px;height:44px;position:relative"><div style="position:absolute;inset:0;background:rgba(245,144,0,0.25);border-radius:50%" class="live-ping"></div><div style="position:absolute;inset:6px;background:linear-gradient(135deg,#FFC15E,#F59000);border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 4px 16px rgba(245,144,0,0.5)"><svg viewBox="0 0 24 24" width="16" height="16" fill="#1A1918"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg></div></div>`,
      className: '', iconSize: [44, 44], iconAnchor: [22, 22],
    });

    // ── 3. Pickup marker ──────────────────────────────────────────────
    L.marker([pick.lat, pick.lng], { icon: pickupIcon })
      .bindPopup('<b>Your Pickup Point</b>')
      .addTo(map);

    // ── 4. All stop markers (decorative only — not in route) ──────────
    if (booking.stops?.length > 0) {
      booking.stops.forEach((stop, index) => {
        const sLat = Number(stop.location?.lat || stop.lat);
        const sLng = Number(stop.location?.lng || stop.lng);
        if (!isNaN(sLat) && !isNaN(sLng) && sLat !== 0 && sLng !== 0) {
          const stopIcon = L.divIcon({
            html: `<div style="width:32px;height:32px;background:#16A34A;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 4px 16px rgba(22,163,74,0.5)"><span style="color:white;font-weight:bold;font-size:12px">${index + 1}</span></div>`,
            className: '', iconSize: [32, 32], iconAnchor: [16, 32],
          });
          L.marker([sLat, sLng], { icon: stopIcon })
            .bindPopup(`<b>Stop ${index + 1}: ${stop.name || ''}</b>`)
            .addTo(map);
        }
      });
    }

    // ── 5. Rider initial position & first route draw ──────────────────
    const hasRiderPos    = !!(booking.liveLocation?.lat || booking.rider?.lat);
    const hasStarted     = booking.tracking?.currentStage && booking.tracking.currentStage !== 'assigned';
    const initialRiderLat = Number(booking.liveLocation?.lat || booking.rider?.lat || pick.lat);
    const initialRiderLng = Number(booking.liveLocation?.lng || booking.rider?.lng || pick.lng);

    if (hasStarted || hasRiderPos) {
      riderMarker.current = L.marker([initialRiderLat, initialRiderLng], { icon: carIcon }).addTo(map);
      // Draw initial route: rider → pickup
      drawRiderToPickup(map, initialRiderLat, initialRiderLng, pick.lat, pick.lng);
    } else {
      // Rider not moving yet — just show pickup area
      map.setView([pick.lat, pick.lng], 14);
    }

    // ── 6. Tourist GPS blue dot ───────────────────────────────────────
    const touristIcon = L.divIcon({
      html: `<div style="width:16px;height:16px;background:#3B82F6;border-radius:50%;border:2px solid white;box-shadow:0 0 10px rgba(59,130,246,0.5)"></div>`,
      className: '', iconSize: [16, 16], iconAnchor: [8, 8],
    });
    const tMarker = L.marker([pick.lat, pick.lng], { icon: touristIcon }).addTo(map);

    // ── 7. Tourist GPS watcher ────────────────────────────────────────
    const socket = getTouristSocket();
    const bId    = booking.id || booking._id;
    let touristWatcher = null;

    if (navigator.geolocation) {
      touristWatcher = navigator.geolocation.watchPosition(
        pos => {
          const { latitude, longitude } = pos.coords;
          tMarker.setLatLng([latitude, longitude]);
          if (socket && bId) {
            socket.emit('update-tourist-location', { bookingId: bId, lat: latitude, lng: longitude });
          }
        },
        null,
        { enableHighAccuracy: true },
      );
    }

    // ── 8. Rider location updates via socket ──────────────────────────
    if (socket && bId) {
      socket.emit('join-ride', bId);

      socket.on('ride-location-updated', async (data) => {
        if (!data.lat || !data.lng) return;

        // Smooth-slide rider marker
        if (riderMarker.current) {
          slideMarkerTo(riderMarker.current, [data.lat, data.lng], 2000);
        } else if (mapInstance.current) {
          riderMarker.current = L.marker([data.lat, data.lng], { icon: carIcon }).addTo(mapInstance.current);
        }

        setElapsedKm(prev => prev + 0.01);

        if (!mapInstance.current) return;

        // Re-draw route only if rider moved >30 m
        if (lastRiderPos.current) {
          const prev    = L.latLng(lastRiderPos.current.lat, lastRiderPos.current.lng);
          const curr    = L.latLng(data.lat, data.lng);
          const distM   = prev.distanceTo(curr);
          if (distM > 30) {
            await drawRiderToPickup(mapInstance.current, data.lat, data.lng, pick.lat, pick.lng);
          }
        } else {
          // First update — always draw
          await drawRiderToPickup(mapInstance.current, data.lat, data.lng, pick.lat, pick.lng);
        }
      });
    }

    // ── 9. Cleanup ────────────────────────────────────────────────────
    return () => {
      if (touristWatcher) navigator.geolocation.clearWatch(touristWatcher);
      if (socket) {
        socket.emit('leave-ride', bId);
        socket.off('ride-location-updated');
      }
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
      riderMarker.current  = null;
      routeLine.current    = null;
      lastRiderPos.current = null;
    };
  }, [booking?.id, booking?._id, booking?.tracking?.currentStage]); // eslint-disable-line react-hooks/exhaustive-deps

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
            <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">
              {booking.rider?.name || 'Your Guide'}
            </p>
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
        <span className="truncate">
          {booking.pickupAddress || booking.pickupLocation?.address}
        </span>
      </div>
    </div>
  );
}
