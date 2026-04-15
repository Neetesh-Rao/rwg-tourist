import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Navigation, X, Search } from 'lucide-react';
import L from 'leaflet';
const GOLD_ICON_HTML = `
  <div style="width:38px;height:38px;filter:drop-shadow(0 4px 12px rgba(245,144,0,0.5))">
    <svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 2C12.373 2 7 7.373 7 14C7 23.5 19 36 19 36C19 36 31 23.5 31 14C31 7.373 25.627 2 19 2Z" fill="url(#pg)" stroke="#E07200" stroke-width="1.5"/>
      <circle cx="19" cy="14" r="5" fill="#1A1918" fill-opacity="0.9"/>
      <defs><linearGradient id="pg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FFC15E"/><stop offset="1" stop-color="#E07200"/></linearGradient></defs>
    </svg>
  </div>`;

const RIDER_ICON_HTML = `
  <div style="width:40px;height:40px;position:relative">
    <div style="position:absolute;inset:0;background:rgba(34,197,94,0.2);border-radius:50%;animation:none"></div>
    <div style="position:absolute;inset:5px;background:#16A34A;border-radius:50%;border:2px solid #22C55E;display:flex;align-items:center;justify-content:center">
      <svg viewBox="0 0 16 16" width="10" height="10" fill="white">
        <path d="M14 9.5L12.5 5.5C12.3 5 11.7 4.5 11 4.5H5C4.3 4.5 3.7 5 3.5 5.5L2 9.5V13.5C2 13.8 2.2 14 2.5 14H3.5C3.8 14 4 13.8 4 13.5V13H12V13.5C12 13.8 12.2 14 12.5 14H13.5C13.8 14 14 13.8 14 13.5V9.5ZM4.5 11C3.95 11 3.5 10.55 3.5 10C3.5 9.45 3.95 9 4.5 9C5.05 9 5.5 9.45 5.5 10C5.5 10.55 5.05 11 4.5 11ZM11.5 11C10.95 11 10.5 10.55 10.5 10C10.5 9.45 10.95 9 11.5 9C12.05 9 12.5 9.45 12.5 10C12.5 10.55 12.05 11 11.5 11Z"/>
      </svg>
    </div>
  </div>`;

export default function MapPicker({ city, value, onChange, riders = [], height = '320px' }) {
  const mapRef      = useRef(null);
  const mapInstance = useRef(null);
  const markerRef   = useRef(null);
  const [address,   setAddress]   = useState('');
  const [locating,  setLocating]  = useState(false);
  const [search,    setSearch]    = useState('');

  const goldMarker  = useCallback(() => {
    if (!L) return null;
    return L.divIcon({ html: GOLD_ICON_HTML, className: '', iconSize: [38,38], iconAnchor: [19,38] });
  }, []);

  const riderMarker = useCallback(() => {
    if (!L) return null;
    return L.divIcon({ html: RIDER_ICON_HTML, className: '', iconSize: [40,40], iconAnchor: [20,20] });
  }, []);

  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`);
      const d = await r.json();
      return d.display_name ? d.display_name.split(',').slice(0,3).join(', ') : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } catch {
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
  }, []);

  const placeMarker = useCallback(async (lat, lng, map) => {
    if (!L || !map) return;
    const icon = goldMarker();
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { icon, draggable: true }).addTo(map);
      markerRef.current.on('dragend', async () => {
        const p = markerRef.current.getLatLng();
        const addr = await reverseGeocode(p.lat, p.lng);
        setAddress(addr);
        onChange({ lat: p.lat, lng: p.lng }, addr);
      });
    }
    const addr = await reverseGeocode(lat, lng);
    setAddress(addr);
    onChange({ lat, lng }, addr);
  }, [goldMarker, reverseGeocode, onChange]);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
   
    const centerLat = value?.lat || 26.9124;
    const centerLng = value?.lng || 75.7873;

    const map = L.map(mapRef.current, {
      center: [centerLat, centerLng],
      zoom: 14,
      zoomControl: false,
    });
    mapInstance.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Existing pin
    if (value?.lat) {
      markerRef.current = L.marker([value.lat, value.lng], { icon: goldMarker(), draggable: true }).addTo(map);
      markerRef.current.on('dragend', async () => {
        const p = markerRef.current.getLatLng();
        const addr = await reverseGeocode(p.lat, p.lng);
        setAddress(addr);
        onChange({ lat: p.lat, lng: p.lng }, addr);
      });
    }

    // Rider markers
    riders.forEach(r => {
      if (r.lat && r.lng) {
        L.marker([r.lat, r.lng], { icon: riderMarker() })
          .bindPopup(`<div style="font-family:'DM Sans',sans-serif;padding:4px;min-width:120px"><b style="font-size:13px;color:var(--text)">${r.name}</b><br/><span style="color:#F59000;font-size:11px">★ ${r.rating}</span><br/><span style="font-size:11px;color:var(--text-2)">${r.vehicleType}</span></div>`)
          .addTo(map);
      }
    });

    // Click to pin
    map.on('click', async (e) => {
      await placeMarker(e.latlng.lat, e.latlng.lng, map);
    });

    return () => {
      map.remove();
      mapInstance.current = null;
      markerRef.current = null;
    };
  }, []); // eslint-disable-line

  // Fly to new city
  useEffect(() => {
    if (!mapInstance.current || !city) return;
    const coords = {
      jaipur:   [26.9124, 75.7873], delhi:    [28.6139, 77.2090],
      agra:     [27.1767, 78.0081], goa:      [15.2993, 74.1240],
      mumbai:   [19.0760, 72.8777], udaipur:  [24.5854, 73.7125],
      varanasi: [25.3176, 82.9739], mysore:   [12.2958, 76.6394],
    };
    const c = coords[city];
    if (c) mapInstance.current.flyTo(c, 13, { duration: 1.5 });
  }, [city]);

  function handleGPS() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        mapInstance.current?.flyTo([lat, lng], 16, { duration: 1.5 });
        await placeMarker(lat, lng, mapInstance.current);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  function clearPin() {
    if (markerRef.current && mapInstance.current) {
      mapInstance.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }
    setAddress('');
    onChange({ lat: 0, lng: 0 }, '');
  }

  return (
    <div className="space-y-3">
      {/* Map */}
      <div className="relative rounded-2xl overflow-hidden border border-[var(--border)]" style={{ height }}>
        <div ref={mapRef} className="w-full h-full" />

        {/* Search overlay */}
        <div className="absolute top-3 left-3 right-3 z-[999] flex gap-2">
          <div className="flex-1 glass rounded-xl flex items-center gap-2 px-3 py-2.5 border border-[var(--border)]">
            <Search className="w-4 h-4 text-ink-400 flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search location…"
              className="flex-1 bg-transparent text-sm text-[var(--text)] placeholder-[var(--text-3)] outline-none"
            />
          </div>
          <button
            onClick={handleGPS}
            title="Use current location"
            className={`glass border border-[var(--border)] rounded-xl p-2.5 transition-all ${locating ? 'border-brand-400 text-brand-500' : 'text-ink-400 hover:text-brand-500 hover:border-brand-400'}`}
          >
            {locating
              ? <div className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
              : <Navigation className="w-4 h-4" />
            }
          </button>
        </div>

        {/* Hint */}
        {!value?.lat && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-[999] pointer-events-none">
            <div className="glass border border-[var(--border)] rounded-xl px-4 py-2 text-xs text-ink-500 whitespace-nowrap flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-brand-500" />
              Tap map to drop your pickup pin
            </div>
          </div>
        )}

        {/* Riders nearby */}
        {riders.length > 0 && (
          <div className="absolute bottom-3 left-3 z-[999]">
            <div className="glass border border-green-500/30 rounded-full px-3 py-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-brand" />
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">{riders.length} guides nearby</span>
            </div>
          </div>
        )}
      </div>

      {/* Selected address */}
      {address && (
        <div className="flex items-start gap-2.5 card !p-3 border-brand-200 dark:border-brand-800/40 bg-brand-50/50 dark:bg-brand-900/10">
          <MapPin className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold uppercase tracking-wider mb-0.5">Pickup pin set</p>
            <p className="text-sm text-ink-800 dark:text-ink-200 truncate">{address}</p>
          </div>
          <button onClick={clearPin} className="text-ink-400 hover:text-red-500 transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
