import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Navigation2, MapPin } from 'lucide-react';
import { getTouristSocket } from '@/socket/socket';
import L from 'leaflet';

import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet.marker.slideto';

// ─── Map Icons ────────────────────────────────────────────────────────────────
const PICKUP_ICON = `<div style="width:36px;height:36px;background:linear-gradient(135deg,#FFC15E,#E07200);border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 4px 16px rgba(245,144,0,0.5)"><svg viewBox="0 0 24 24" width="16" height="16" fill="#1A1918"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>`;
const CAR_ICON  = `<div id="rider-car" style="width:44px;height:44px;position:relative"><div style="position:absolute;inset:0;background:rgba(245,144,0,0.25);border-radius:50%" class="live-ping"></div><div style="position:absolute;inset:6px;background:linear-gradient(135deg,#FFC15E,#F59000);border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 4px 16px rgba(245,144,0,0.5)"><svg viewBox="0 0 24 24" width="16" height="16" fill="#1A1918"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg></div></div>`;
const TOURIST_ICON = `<div style="width:16px;height:16px;background:#3B82F6;border-radius:50%;border:2px solid white;box-shadow:0 0 10px rgba(59,130,246,0.5)"></div>`;
const STOP_ICON_HTML = (index, isCompleted = false) =>
  `<div style="width:32px;height:32px;background:${isCompleted ? '#6B7280' : '#16A34A'};border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 4px 16px rgba(22,163,74,0.3)"><span style="color:white;font-weight:900;font-size:12px">${isCompleted ? '✓' : index}</span></div>`;

// ─── Get next destination based on ride stage ─────────────────────────────────
function getNextDestination(booking) {
  if (!booking) return null;

  const stage          = booking.tracking?.currentStage || 'assigned';
  const completedStops = booking.tracking?.completedStops || [];
  const stops          = booking.stops || [];
  const pickupLat      = Number(booking.pickupLat || booking.pickupLocation?.lat);
  const pickupLng      = Number(booking.pickupLng || booking.pickupLocation?.lng);

  if (['heading_to_pickup', 'arrived_at_pickup'].includes(stage)) {
    if (pickupLat && pickupLng) return { lat: pickupLat, lng: pickupLng, label: 'Pickup Point' };
    return null;
  }

  if (['trip_started', 'completed_stop', 'heading_to_stop', 'arrived_at_stop'].includes(stage)) {
    const nextStop = stops.find(s => !completedStops.map(String).includes(String(s.id || s._id)));
    if (nextStop) {
      const sLat = Number(nextStop.lat || nextStop.location?.lat || nextStop.coords?.lat || nextStop.latitude);
      const sLng = Number(nextStop.lng || nextStop.location?.lng || nextStop.coords?.lng || nextStop.longitude);
      if (sLat && sLng) return { lat: sLat, lng: sLng, label: nextStop.name || 'Next Stop' };
    }
    return null;
  }

  return null;
}

export default function LiveTracker({ booking, height = '450px' }) {
  const mapRef            = useRef(null);
  const mapInstance       = useRef(null);
  const riderMarker       = useRef(null);
  const touristMarker     = useRef(null);
  const routingControl    = useRef(null);
  const stopMarkersRef    = useRef([]);
  const lastRiderPos      = useRef(null);
  const lastDestKey       = useRef('');
  const [elapsedKm, setElapsedKm] = useState(0);
  const [riderLocation, setRiderLocation] = useState(null); // Local state for reactivity

  const pick = {
    lat: Number(booking?.pickupLat || booking?.pickupLocation?.lat || 28.6139),
    lng: Number(booking?.pickupLng || booking?.pickupLocation?.lng || 77.2090),
  };

  // ── Remove the current LRM routing control ────────────────────────────────
  const clearRouting = useCallback(() => {
    if (routingControl.current && mapInstance.current) {
      try { mapInstance.current.removeControl(routingControl.current); } catch (_) {}
      routingControl.current = null;
    }
  }, []);

  // ── Create a new LRM control for fromLat→toLat ────────────────────────────
  const createRouting = useCallback((fromLat, fromLng, toLat, toLng) => {
    if (!mapInstance.current) return;
    clearRouting();

    routingControl.current = L.Routing.control({
      waypoints: [
        L.latLng(fromLat, fromLng),
        L.latLng(toLat, toLng),
      ],
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
        profile: 'driving',
      }),
      lineOptions: {
        styles: [{ color: '#F59000', weight: 5, opacity: 0.9 }],
        extendToWaypoints: true,
        missingRouteTolerance: 0,
      },
      show:               true,
      collapsible:        true,
      collapsed:          false,
      routeWhileDragging: false,
      draggableWaypoints: false,
      addWaypoints:       false,
      fitSelectedRoutes:  true,
      createMarker: () => null,
    }).addTo(mapInstance.current);

    lastRiderPos.current = { lat: fromLat, lng: fromLng };
  }, [clearRouting]);

  // ── Smooth-slide / create rider marker ────────────────────────────────────
  const updateRiderMarker = useCallback((lat, lng) => {
    if (!mapInstance.current || !lat || !lng) return;
    const icon = L.divIcon({ html: CAR_ICON, className: '', iconSize: [44, 44], iconAnchor: [22, 22] });
    if (riderMarker.current) {
      if (riderMarker.current.slideTo) {
        riderMarker.current.slideTo([lat, lng], { duration: 3000, keepAtCenter: false });
      } else {
        riderMarker.current.setLatLng([lat, lng]);
      }
    } else {
      riderMarker.current = L.marker([lat, lng], { icon, zIndexOffset: 1000 }).addTo(mapInstance.current);
    }
  }, []);

  // ── Refresh stop-marker colours when completedStops changes ───────────────
  const refreshStopMarkers = useCallback(() => {
    if (!mapInstance.current) return;
    const completedStops = booking?.tracking?.completedStops || [];
    const stops          = booking?.stops || [];

    stopMarkersRef.current.forEach(m => mapInstance.current.removeLayer(m));
    stopMarkersRef.current = [];

    stops.forEach((s, i) => {
      const sLat = Number(s.lat || s.location?.lat || s.coords?.lat || s.latitude);
      const sLng = Number(s.lng || s.location?.lng || s.coords?.lng || s.longitude);
      if (!sLat || !sLng) return;
      const isDone = completedStops.map(String).includes(String(s.id || s._id));
      const si = L.divIcon({ html: STOP_ICON_HTML(i + 1, isDone), className: '', iconSize: [32, 32], iconAnchor: [16, 32] });
      const m  = L.marker([sLat, sLng], { icon: si })
        .bindPopup(`<b>Stop ${i + 1}: ${s.name}</b>${isDone ? ' ✓ Completed' : ''}`)
        .addTo(mapInstance.current);
      stopMarkersRef.current.push(m);
    });
  }, [booking?.stops, booking?.tracking?.completedStops]);

  // ── 1. Init map & GPS once ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !window.L || !booking || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [pick.lat, pick.lng],
      zoom: 14,
      zoomControl: false,
    });
    mapInstance.current = map;
    setTimeout(() => mapInstance.current?.invalidateSize(), 500);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OSM', maxZoom: 19,
    }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Pickup marker
    const pickupIcon = L.divIcon({ html: PICKUP_ICON, className: '', iconSize: [36, 36], iconAnchor: [18, 36] });
    L.marker([pick.lat, pick.lng], { icon: pickupIcon }).bindPopup('<b>Your Pickup Point</b>').addTo(map);

    // Initial stop markers
    refreshStopMarkers();

    // Tourist live dot
    const tIcon = L.divIcon({ html: TOURIST_ICON, className: '', iconSize: [16, 16], iconAnchor: [8, 8] });
    touristMarker.current = L.marker([pick.lat, pick.lng], { icon: tIcon }).addTo(map);

    let touristWatcher = null;
    const socket = getTouristSocket();
    const bId    = booking.id || booking._id;

    if (navigator.geolocation) {
      touristWatcher = navigator.geolocation.watchPosition(
        pos => {
          const { latitude, longitude } = pos.coords;
          if (touristMarker.current) touristMarker.current.setLatLng([latitude, longitude]);
          if (socket && bId) {
            socket.emit('update-tourist-location', { bookingId: bId, lat: latitude, lng: longitude });
          }
        },
        null,
        { enableHighAccuracy: true },
      );
    }

    // Set initial rider pos if available
    const initialRiderLat = Number(booking.liveLocation?.lat || booking.rider?.lat);
    const initialRiderLng = Number(booking.liveLocation?.lng || booking.rider?.lng);
    if (initialRiderLat && initialRiderLng) {
      setRiderLocation({ lat: initialRiderLat, lng: initialRiderLng });
    }

    if (socket && bId) {
      socket.emit('join-ride', bId);
      socket.on('ride-location-updated', (data) => {
        if (!data.lat || !data.lng) return;
        setRiderLocation({ lat: data.lat, lng: data.lng });
        setElapsedKm(prev => prev + 0.01);
      });
    }

    return () => {
      if (touristWatcher) navigator.geolocation.clearWatch(touristWatcher);
      if (socket) {
        socket.emit('leave-ride', bId);
        socket.off('ride-location-updated');
      }
      clearRouting();
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
      riderMarker.current   = null;
      touristMarker.current = null;
      stopMarkersRef.current= [];
      lastRiderPos.current  = null;
      lastDestKey.current   = '';
    };
  }, [booking?.id, booking?._id]); // Run ONCE for map setup

  // ── 2. Refresh stop colours when stage/completed changes ──────────────────
  const completedStopsKey = (booking?.tracking?.completedStops || []).join(',');
  useEffect(() => { refreshStopMarkers(); }, [completedStopsKey, refreshStopMarkers]);

  // ── 3. Main routing & rider marker effect ─────────────────────────────────
  const stage = booking?.tracking?.currentStage;

  useEffect(() => {
    if (!mapInstance.current || !riderLocation || !booking) return;

    updateRiderMarker(riderLocation.lat, riderLocation.lng);

    const dest    = getNextDestination(booking);
    const destKey = dest ? `${dest.lat},${dest.lng}` : 'none';

    // ── Destination changed → tear down old LRM & create new ──────────────
    if (destKey !== lastDestKey.current) {
      lastDestKey.current  = destKey;
      lastRiderPos.current = null;

      if (dest) {
        createRouting(riderLocation.lat, riderLocation.lng, dest.lat, dest.lng);
      } else {
        clearRouting(); // all stops done or idle — remove panel
      }
      return;
    }

    // ── Same destination — splice start waypoint if moved >30 m ───────────
    if (!dest || !routingControl.current) return;

    if (lastRiderPos.current) {
      const prev = L.latLng(lastRiderPos.current.lat, lastRiderPos.current.lng);
      const curr = L.latLng(riderLocation.lat, riderLocation.lng);
      if (prev.distanceTo(curr) > 30) {
        routingControl.current.spliceWaypoints(0, 1, L.latLng(riderLocation.lat, riderLocation.lng));
        lastRiderPos.current = { lat: riderLocation.lat, lng: riderLocation.lng };
      }
    } else {
      createRouting(riderLocation.lat, riderLocation.lng, dest.lat, dest.lng);
    }
  }, [riderLocation, stage, completedStopsKey, booking, createRouting, clearRouting, updateRiderMarker]);


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
