import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Plus, X, ChevronRight, ChevronLeft, Check, Shield, Zap, Wallet, CreditCard, Smartphone, Landmark, Loader2 } from 'lucide-react';
import {
  useAppDispatch, useBooking, useDraft, useEstimate, useSlots, useStep, useUser,
} from '@/app/store/store';
import {
  setStep, updateDraft, selectSlot, bookingCreated, addStop, removeStop, resetWizard,
  fetchSlots, estimatePrice,
} from '@/app/store/slices/bookingSlice';
import { debitWallet } from '@/app/store/slices/authSlice';
import { useCreateBookingMutation } from '@/app/store/slices/bookingApi';
import { usePayWithWalletMutation } from '@/app/store/slices/walletApi';
import { useCreateOrderMutation, useVerifyPaymentMutation } from '@/app/store/slices/paymentApi';
import { pushToast } from '@/app/store/slices/uiWalletSlice';
import PageWrapper from '@/shared/layout/PageWrapper/PageWrapper';
import Button from '@/shared/ui/Button/Button';
import Input from '@/shared/ui/Input/Input';
import Select from '@/shared/ui/Select/Select';
import Textarea from '@/shared/ui/Textarea/Textarea';
import Card from '@/shared/ui/Card/Card';
import Badge from '@/shared/ui/Badge/Badge';
import Modal from '@/shared/ui/Modal/Modal';
import StarRating from '@/shared/ui/StarRating/StarRating';
import { Skeleton } from '@/shared/ui/Loader/Loader';
import MapPicker from '@/shared/map/MapPicker/MapPicker';
import { CITIES, RIDE_TYPES, CITY_STOPS, LANGUAGES, PAYMENT_METHODS, UPI_APPS } from '@/shared/config/constants';
import { formatINR, getTomorrow } from '@/shared/lib/helpers';

const STEPS = ['Trip Details', 'Your Stops', 'Review & Pay'];

const formatBookingTime = (time) => {
  if (!time) return '';
  const [hours = '0', minutes = '00'] = time.split(':');
  const hour = Number(hours);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const twelveHour = hour % 12 || 12;
  return `${String(twelveHour).padStart(2, '0')}:${minutes} ${suffix}`;
};

const mapDurationType = (rideType) => {
  const durationMap = {
    '2hr': '2-hour',
    '5hr': '5-hour',
    fullday: 'full-day',
    custom: 'custom',
  };
  return durationMap[rideType] || rideType;
};

const mapGenderPreference = (preference) => {
  const preferenceMap = {
    female_first: 'Female guide preferred',
    male_first: 'Male guide preferred',
    any: 'No preference',
  };
  return preferenceMap[preference] || preference;
};

const PAYMENT_META = {
  upi: {
    Icon: Smartphone,
    title: 'Razorpay UPI Checkout',
    helper: 'Choose your UPI app and complete payment in the Razorpay window.',
    cta: 'Pay with UPI',
  },
  card: {
    Icon: CreditCard,
    title: 'Razorpay Card Checkout',
    helper: 'Use your debit or credit card securely through Razorpay.',
    cta: 'Pay with Card',
  },
  wallet: {
    Icon: Wallet,
    title: 'RwG Wallet',
    helper: 'The advance amount will be deducted directly from your wallet.',
    cta: 'Pay with Wallet',
  },
  netbank: {
    Icon: Landmark,
    title: 'Razorpay Net Banking',
    helper: 'Continue to Razorpay and select your bank to finish payment.',
    cta: 'Pay with Net Banking',
  },
};

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector('script[data-razorpay="checkout"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true), { once: true });
      existingScript.addEventListener('error', () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.razorpay = 'checkout';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const getRazorpayOrderData = (payload) => {
  const root = payload || {};
  const data = root?.data || {};
  const meta = data?.meta || root?.meta || {};
  const nestedOrder =
    data?.order ||
    root?.order ||
    data?.razorpayOrder ||
    root?.razorpayOrder ||
    data?.data?.order ||
    root?.data?.data?.order ||
    data?.result?.order ||
    root?.result?.order;

  const order = nestedOrder || data || root;

  const key =
    data?.key ||
    data?.keyId ||
    data?.key_id ||
    data?.razorpay_key ||
    data?.razorpayKey ||
    root?.key ||
    root?.keyId ||
    root?.key_id ||
    root?.razorpay_key ||
    root?.razorpayKey ||
    order?.key ||
    order?.keyId ||
    order?.key_id ||
    order?.razorpay_key ||
    meta?.key ||
    meta?.keyId ||
    meta?.key_id ||
    meta?.razorpay_key ||
    import.meta.env.VITE_RAZORPAY_KEY_ID;

  const orderId =
    order?.id ||
    order?.orderId ||
    order?.order_id ||
    order?.razorpayOrderId ||
    data?.orderId ||
    data?.order_id ||
    data?.razorpayOrderId ||
    root?.orderId ||
    root?.order_id ||
    root?.razorpayOrderId ||
    meta?.orderId ||
    meta?.order_id;

  return {
    key,
    orderId,
    amount: order?.amount || order?.amount_due || data?.amount || data?.amount_due || root?.amount || root?.amount_due,
    currency: order?.currency || data?.currency || root?.currency || meta?.currency || 'INR',
  };
};

// ── Step indicator ─────────────────────────────────────
function StepBar({ current }) {
  return (
    <div className="flex items-center mb-10">
      {STEPS.map((label, i) => (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center flex-shrink-0">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-400 ${
              i + 1 < current  ? 'bg-brand-500 text-white'
              : i + 1 === current ? 'bg-brand-500 text-white ring-4 ring-brand-100 dark:ring-brand-900/40'
              : 'bg-surface-2 dark:bg-surface-3 text-ink-400 border border-[var(--border)]'
            }`}>
              {i + 1 < current ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`mt-1.5 text-[10px] tracking-wide uppercase font-semibold hidden sm:block ${
              i + 1 === current ? 'text-brand-600 dark:text-brand-400' : 'text-ink-400'
            }`}>{label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-px mx-2 transition-all duration-500 ${i + 1 < current ? 'bg-brand-500' : 'bg-[var(--border)]'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Step 1: Trip Details ───────────────────────────────
function TripDetails() {
  const dispatch = useAppDispatch();
  const draft = useDraft();
  const [showMap, setShowMap] = useState(false);
  const [form, setForm] = useState({
    city:              draft.city              || '',
    date:              draft.date              || '',
    startTime:         draft.startTime         || '09:00',
    endTime:           draft.endTime           || '17:00',
    rideType:          draft.rideType          || '5hr',
    genderPreference:  draft.genderPreference  || 'female_first',
    preferredLanguage: draft.preferredLanguage || 'English',
    pickupAddress:     draft.pickupAddress     || '',
    pickupLat:         draft.pickupLat         || null,
    pickupLng:         draft.pickupLng         || null,
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const selRT = RIDE_TYPES.find(r => r.id === form.rideType);

  function handleNext() {
    if (!form.city || !form.date || !form.pickupAddress) return;
    dispatch(updateDraft(form));
    dispatch(fetchSlots({ city: form.city, date: form.date, startTime: form.startTime, endTime: form.endTime, genderPreference: form.genderPreference }));
    dispatch(estimatePrice({ cityId: form.city, rideTypeId: form.rideType, hoursBOOKED: selRT?.hours || 5 }));
    dispatch(setStep(2));
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="City" required placeholder="Select destination"
          options={CITIES.map(c => ({ value: c.id, label: c.name }))}
          value={form.city}
          onChange={e => { set('city', e.target.value); setShowMap(false); }}
        />
        <Input
          label="Date" type="date" required min={getTomorrow()}
          leftIcon={<Clock className="w-4 h-4" />}
          value={form.date} onChange={e => set('date', e.target.value)}
        />
      </div>

      {/* Ride type */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">Tour duration *</label>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {RIDE_TYPES.map(rt => (
            <label key={rt.id}
              className={`flex flex-col p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${form.rideType === rt.id ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20 shadow-glow' : 'border-[var(--border-md)] hover:border-brand-300 dark:hover:border-brand-700'}`}>
              <input type="radio" name="rideType" value={rt.id} checked={form.rideType === rt.id} onChange={() => set('rideType', rt.id)} className="sr-only" />
              <span className="text-2xl mb-2">{rt.emoji}</span>
              <span className="text-sm font-bold text-ink-900 dark:text-ink-100">{rt.label}</span>
              <span className="text-xs text-ink-400 mt-0.5">{rt.desc}</span>
              {rt.hours > 0 && <span className="text-xs font-mono text-brand-500 mt-2 font-bold">{rt.hours}h</span>}
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Start time" type="time" leftIcon={<Clock className="w-4 h-4" />} value={form.startTime} onChange={e => set('startTime', e.target.value)} />
        <Input label="End time"   type="time" leftIcon={<Clock className="w-4 h-4" />} value={form.endTime}   onChange={e => set('endTime',   e.target.value)} />
      </div>

      {/* Pickup with map */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">Pickup location *</label>
          {form.city && (
            <button type="button" onClick={() => setShowMap(m => !m)} className="text-xs text-brand-500 hover:text-brand-600 font-semibold transition-colors flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />{showMap ? 'Hide map' : 'Pin on map'}
            </button>
          )}
        </div>
        {form.city && showMap && (
          <div className="animate-fade-in">
            <MapPicker
              city={form.city}
              value={form.pickupLat ? { lat: form.pickupLat, lng: form.pickupLng } : null}
              onChange={(latlng, addr) => setForm(f => ({ ...f, pickupAddress: addr, pickupLat: latlng.lat, pickupLng: latlng.lng }))}
              riders={[]}
            />
          </div>
        )}
        <Input placeholder="Or type your hotel / landmark name…" leftIcon={<MapPin className="w-4 h-4" />}
          value={form.pickupAddress} onChange={e => set('pickupAddress', e.target.value)}
          hint="Your guide will navigate directly to your location" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select label="Guide gender preference"
          options={[{ value:'female_first',label:'Female guide preferred' },{ value:'male_first',label:'Male guide preferred' },{ value:'any',label:'No preference' }]}
          value={form.genderPreference} onChange={e => set('genderPreference', e.target.value)} />
        <Select label="Language"
          options={LANGUAGES.map(l => ({ value:l, label:l }))}
          value={form.preferredLanguage} onChange={e => set('preferredLanguage', e.target.value)} />
      </div>

      <div className="flex justify-end pt-2">
        <Button variant="primary" size="lg" onClick={handleNext} disabled={!form.city || !form.date || !form.pickupAddress} iconRight={<ChevronRight className="w-4 h-4" />}>
          Add Stops
        </Button>
      </div>
    </div>
  );
}

// ── Step 2: Choose Guide ───────────────────────────────
// function ChooseGuide() {
//   const dispatch = useAppDispatch();
//   const slots    = useSlots();
//   const estimate = useEstimate();
//   const { isLoading } = useBooking();
//   const [selId, setSelId] = useState('');

//   function handleNext() {
//     if (!selId) return;
//     const slot = slots.find(s => s.id === selId);
//     dispatch(selectSlot(slot));
//     dispatch(updateDraft({ selectedSlotId: selId }));
//     dispatch(setStep(3));
//   }

//   if (isLoading) return (
//     <div className="space-y-4">
//       {[1,2,3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" style={{ animationDelay: `${i*100}ms` }} />)}
//     </div>
//   );

//   return (
//     <div className="space-y-4 animate-fade-up">
//       {/* Price banner */}
//       {estimate && (
//         <Card className="!p-4 border-brand-200 dark:border-brand-800/40 bg-brand-50/60 dark:bg-brand-900/10">
//           <div className="flex items-center justify-between flex-wrap gap-3">
//             <div>
//               <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold uppercase tracking-wider mb-1">Estimated price range</p>
//               <p className="font-display text-2xl font-bold text-gradient">{formatINR(estimate.estimatedMin)} – {formatINR(estimate.estimatedMax)}</p>
//             </div>
//             <div className="text-right">
//               <p className="text-xs text-ink-400 mb-0.5">Pay now (30% advance)</p>
//               <p className="font-display text-xl font-bold text-brand-600 dark:text-brand-400">{formatINR(estimate.advanceAmount)}</p>
//             </div>
//           </div>
//         </Card>
//       )}

//       {/* Guide cards */}
//       {slots.map(slot => (
//         <div key={slot.id} onClick={() => setSelId(slot.id)}
//           className={`card !p-5 cursor-pointer transition-all duration-250 ${selId === slot.id ? 'card-selected' : 'card-active'}`}>
//           {selId === slot.id && (
//             <div className="absolute top-4 right-4 w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center">
//               <Check className="w-3.5 h-3.5 text-white" />
//             </div>
//           )}
//           <div className="flex items-start gap-4">
//             <div className="relative flex-shrink-0">
//               <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/30 dark:to-brand-800/20 flex items-center justify-center font-display text-2xl font-bold text-brand-700 dark:text-brand-400">
//                 {slot.rider.name.charAt(0)}
//               </div>
//               <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[var(--surface)] ${slot.rider.isOnline ? 'bg-green-500' : 'bg-ink-300 dark:bg-ink-600'}`} />
//             </div>
//             <div className="flex-1 min-w-0">
//               <div className="flex items-center gap-2 flex-wrap mb-1">
//                 <h3 className="font-semibold text-ink-900 dark:text-ink-100">{slot.rider.name}</h3>
//                 <Badge variant={slot.rider.gender === 'female' ? 'brand' : 'neutral'}>{slot.rider.gender === 'female' ? '♀ Female' : '♂ Male'}</Badge>
//                 {slot.rider.isOnline && <Badge variant="green">Online</Badge>}
//               </div>
//               <StarRating rating={slot.rider.rating} count={slot.rider.totalRides} />
//               <p className="text-xs text-ink-500 mt-2 line-clamp-2">{slot.rider.bio}</p>
//               <div className="flex flex-wrap gap-1.5 mt-2">
//                 {slot.rider.languages.map(l => <Badge key={l} variant="neutral" size="xs">{l}</Badge>)}
//               </div>
//               <div className="flex flex-wrap gap-1.5 mt-1.5">
//                 {slot.rider.guideExpertise.map(e => <Badge key={e} variant="blue" size="xs">{e}</Badge>)}
//               </div>
//             </div>
//             <div className="text-right flex-shrink-0">
//               <p className="text-sm font-bold text-ink-900 dark:text-ink-100">{formatINR(slot.rider.pricePerHour)}<span className="text-xs text-ink-400 font-normal">/hr</span></p>
//               <p className="text-xs text-ink-400 mt-0.5">₹{slot.rider.pricePerKm}/km</p>
//             </div>
//           </div>
//           <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-ink-400">
//             <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {slot.startTime}–{slot.endTime} · {slot.rider.vehicleType}</span>
//             <span>{slot.rider.completionRate}% completion</span>
//           </div>
//         </div>
//       ))}

//       <div className="flex justify-between pt-2">
//         <Button variant="ghost" onClick={() => dispatch(setStep(1))} icon={<ChevronLeft className="w-4 h-4" />}>Back</Button>
//         <Button variant="primary" size="lg" disabled={!selId} onClick={handleNext} iconRight={<ChevronRight className="w-4 h-4" />}>Continue</Button>
//       </div>
//     </div>
//   );
// }

// ── Step 2: Add Stops ──────────────────────────────────
function AddStops() {
  const dispatch = useAppDispatch();
  const draft    = useDraft();
  const [custom, setCustom] = useState('');

  const cityStops = CITY_STOPS[draft.city] || [];
  const current   = draft.stops || [];
  const cats      = [...new Set(cityStops.map(s => s.category))];
  const suggestedStops = cityStops.filter(
    (stop) =>
      stop.name.toLowerCase().includes(custom.trim().toLowerCase()) &&
      !current.some((item) => item.name === stop.name)
  );

  const isAdded = n => current.some(s => s.name === n);

  function toggle(stop) {
    if (isAdded(stop.name)) {
      const found = current.find(s => s.name === stop.name);
      if (found) dispatch(removeStop(found.id));
    } else {
      dispatch(addStop({ id: Date.now().toString(), name: stop.name, address: `${stop.name}, ${draft.city}`, estimatedDuration: stop.duration, lat: stop.lat, lng: stop.lng }));
    }
  }

  function addCustom() {
    if (!custom.trim()) return;
    const matchedStop = cityStops.find(
      (stop) => stop.name.toLowerCase() === custom.trim().toLowerCase()
    );

    dispatch(addStop({
      id: Date.now().toString(),
      name: matchedStop?.name || custom.trim(),
      address: matchedStop ? `${matchedStop.name}, ${draft.city}` : custom.trim(),
      estimatedDuration: matchedStop?.duration || 45,
      lat: matchedStop?.lat,
      lng: matchedStop?.lng,
      type: matchedStop?.category || 'Custom',
      category: matchedStop?.category || 'Custom',
    }));
    setCustom('');
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <Card className="!p-4 border-brand-200 dark:border-brand-800/40 bg-brand-50/60 dark:bg-brand-900/10">
        <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 text-sm">
          <Zap className="w-4 h-4 flex-shrink-0" />
          Adding stops now helps your guide plan the optimal route. You can also add more on the day of the ride.
        </div>
      </Card>

      {cats.map(cat => (
        <div key={cat}>
          <p className="text-xs text-ink-400 uppercase tracking-wider font-semibold mb-2">{cat}</p>
          <div className="flex flex-wrap gap-2">
            {cityStops.filter(s => s.category === cat).map(stop => {
              const added = isAdded(stop.name);
              return (
                <button key={stop.name} onClick={() => toggle(stop)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${added ? 'bg-brand-500 border-brand-500 text-white' : 'border-[var(--border-md)] text-ink-600 dark:text-ink-400 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20'}`}>
                  {added ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                  {stop.name}
                  <span className={`text-[10px] ${added ? 'opacity-80' : 'text-ink-400'}`}>{stop.duration}m</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Custom stop */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Add a custom stop or landmark…"
            value={custom}
            onChange={e => setCustom(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCustom()}
            leftIcon={<MapPin className="w-4 h-4" />}
            className="flex-1"
            list="city-stop-suggestions"
            hint={suggestedStops.length ? `${suggestedStops.length} suggestions found` : 'Type to see matching city stops'}
          />
          <datalist id="city-stop-suggestions">
            {suggestedStops.map((stop) => (
              <option key={stop.name} value={stop.name}>
                {stop.category}
              </option>
            ))}
          </datalist>
        </div>
        <Button variant="secondary" onClick={addCustom} icon={<Plus className="w-4 h-4" />}>Add</Button>
      </div>

      {/* Selected stops list */}
      {current.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-ink-400 uppercase tracking-wider font-semibold">Your itinerary — {current.length} stop{current.length !== 1 ? 's' : ''}</p>
          {current.map((stop, i) => (
            <div key={stop.id} className="flex items-center gap-3 p-3 card !rounded-xl">
              <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{i+1}</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">{stop.name}</p>
                <p className="text-xs text-ink-400">~{stop.estimatedDuration} min</p>
              </div>
              <button onClick={() => dispatch(removeStop(stop.id))} className="text-ink-300 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Textarea label="Special requests" placeholder="Wheelchair access, vegetarian food, slow pace, photography focus…"
        hint="Optional — your guide will be notified" rows={3}
        value={draft.specialRequests || ''} onChange={e => dispatch(updateDraft({ specialRequests: e.target.value }))} />

      <div className="flex justify-between pt-2">
        <Button variant="ghost" onClick={() => dispatch(setStep(1))} icon={<ChevronLeft className="w-4 h-4" />}>Back</Button>
        <Button variant="primary" size="lg" onClick={() => dispatch(setStep(3))} iconRight={<ChevronRight className="w-4 h-4" />}>Review booking</Button>
      </div>
    </div>
  );
}

// ── Step 3: Review & Pay ───────────────────────────────
function ReviewPay() {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const draft     = useDraft();
  const estimate  = useEstimate();
  const user      = useUser();
  const [createBooking, { isLoading }] = useCreateBookingMutation();
  const [payWithWallet, { isLoading: isPayingWithWallet }] = usePayWithWalletMutation();
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [verifyPayment, { isLoading: isVerifyingPayment }] = useVerifyPaymentMutation();
  const [payMethod, setPayMethod] = useState('upi');
  const [upiApp,    setUpiApp]    = useState('');
  const [paymentStage, setPaymentStage] = useState('idle');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const selRT = RIDE_TYPES.find(r => r.id === draft.rideType);
  const walletBalance = user?.walletBalance || 0;
  const advanceAmount = estimate?.advanceAmount || 0;
  const paymentMeta = PAYMENT_META[payMethod] || PAYMENT_META.upi;
  const isBusy = isLoading || isPayingWithWallet || isCreatingOrder || isVerifyingPayment;
  const canUseWallet = walletBalance >= advanceAmount;
  const paymentStageLabel = {
    idle: 'Ready to pay',
    creating_booking: 'Creating booking',
    preparing_order: 'Preparing Razorpay order',
    awaiting_payment: 'Waiting for payment',
    verifying_payment: 'Verifying payment',
    paying_with_wallet: 'Debiting wallet',
  }[paymentStage];

  const openRazorpayCheckout = ({ orderPayload, bookingId }) =>
    new Promise((resolve, reject) => {
      const {
        key: razorpayKey,
        orderId,
        amount,
        currency,
      } = getRazorpayOrderData(orderPayload);

      if (!window.Razorpay || !orderId) {
        console.error('Razorpay order payload missing order id:', orderPayload);
        reject(new Error('Razorpay order id is missing from create-order response.'));
        return;
      }

      if (!razorpayKey) {
        console.error('Razorpay key missing. Add VITE_RAZORPAY_KEY_ID or return key from create-order:', orderPayload);
        reject(new Error('Razorpay key is missing. Add VITE_RAZORPAY_KEY_ID in .env or return the key from create-order API.'));
        return;
      }

      const razorpay = new window.Razorpay({
        key: razorpayKey,
        amount,
        currency,
        name: 'Ride With Guide',
        description: `Advance payment for booking ${bookingId}`,
        order_id: orderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        notes: {
          bookingId,
        },
        handler: async (paymentResponse) => {
          try {
            setPaymentStage('verifying_payment');
            const verifyResponse = await verifyPayment({
              razorpayOrderId: paymentResponse.razorpay_order_id,
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              razorpaySignature: paymentResponse.razorpay_signature,
              bookingId,
            }).unwrap();
            resolve({
              paymentResponse,
              verifyResponse,
            });
          } catch (error) {
            reject(error);
          }
        },
        modal: {
          ondismiss: () => reject(new Error('Payment cancelled by user.')),
        },
      });

      razorpay.open();
    });

  async function handleConfirm() {
    const payload = {
      city: CITIES.find((city) => city.id === draft.city)?.name || draft.city,
      date: draft.date,
      startTime: formatBookingTime(draft.startTime),
      durationType: mapDurationType(draft.rideType),
      pickupLocation: {
        address: draft.pickupAddress,
        lat: draft.pickupLat,
        lng: draft.pickupLng,
      },
      language: draft.preferredLanguage,
      genderPreference: mapGenderPreference(draft.genderPreference),
      stops: (draft.stops || []).map((stop) => ({
        name: stop.name,
        type: stop.category || stop.type || 'Custom',
      })),
      pricing: estimate ? {
        baseFare: estimate.baseFare,
        distanceCost: estimate.distanceCharge,
        timeCharge: estimate.timeCharge,
        guideServiceFee: estimate.guideFee,
        estimatedRange: {
          min: estimate.estimatedMin,
          max: estimate.estimatedMax,
        },
        advanceAmount: estimate.advanceAmount,
      } : undefined,
    };

    try {
      setPaymentModalOpen(true);

      if (payMethod === 'wallet' && walletBalance < advanceAmount) {
        dispatch(pushToast({
          type:'error',
          title:'Insufficient wallet balance',
          message:'Please add money to your wallet or choose another payment method.'
        }));
        setPaymentModalOpen(false);
        return;
      }

      setPaymentStage('creating_booking');
      const response = await createBooking(payload).unwrap();
      const createdBooking = response?.data || response?.booking || response;
      const bookingId = createdBooking?._id || createdBooking?.id;
      let finalBooking = createdBooking;

      if (payMethod === 'wallet') {
        setPaymentStage('paying_with_wallet');
        await payWithWallet({
          user_id: user?._id || user?.id || user?.userId,
          booking_id: bookingId,
          amount: String(advanceAmount),
        }).unwrap();

        dispatch(debitWallet(advanceAmount));
      } else {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error('Could not load Razorpay checkout.');
        }

        setPaymentStage('preparing_order');
        const orderPayload = await createOrder({
          bookingId,
        }).unwrap();

        setPaymentStage('awaiting_payment');
        const razorpayResult = await openRazorpayCheckout({
          orderPayload,
          bookingId,
        });

        const verifiedBooking =
          razorpayResult?.verifyResponse?.data?.booking ||
          razorpayResult?.verifyResponse?.data?.data?.booking ||
          razorpayResult?.verifyResponse?.booking ||
          razorpayResult?.verifyResponse?.data;

        if (verifiedBooking && (verifiedBooking._id || verifiedBooking.id)) {
          finalBooking = {
            ...createdBooking,
            ...verifiedBooking,
          };
        }
      }

      dispatch(bookingCreated(finalBooking));
      dispatch(pushToast({
        type:'success',
        title:'Booking confirmed! 🎉',
        message: response?.message || 'Your booking has been created successfully.'
      }));
      setPaymentModalOpen(false);
      setPaymentStage('idle');
      navigate('/bookings');
    } catch (error) {
      setPaymentModalOpen(false);
      setPaymentStage('idle');
      dispatch(pushToast({
        type:'error',
        title:'Booking failed',
        message: error?.data?.message || error?.message || 'Could not create booking. Please try again.'
      }));
    }
  }

  const rows = estimate ? [
    ['Base fare',            estimate.baseFare],
    ['Distance (est.)',      estimate.distanceCharge],
    ['Time charge',          estimate.timeCharge],
    ['Guide service fee',    estimate.guideFee],
  ] : [];

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Trip summary */}
      <Card className="!p-0 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[var(--border)] flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
          <span className="text-xs font-semibold uppercase tracking-widest text-ink-500">Trip Summary</span>
        </div>
        <div className="p-5 grid grid-cols-2 gap-4">
          {[['City',draft.city],['Date',draft.date],['Time',`${draft.startTime} – ${draft.endTime}`],['Tour',selRT?.label||'—']].map(([k,v]) => (
            <div key={k}><p className="text-xs text-ink-400 mb-0.5">{k}</p><p className="text-sm font-semibold text-ink-900 dark:text-ink-100 capitalize">{v}</p></div>
          ))}
          <div className="col-span-2"><p className="text-xs text-ink-400 mb-0.5">Pickup</p><p className="text-sm font-semibold text-ink-900 dark:text-ink-100">{draft.pickupAddress}</p></div>
        </div>
      </Card>

      {/* Stops */}
      {draft.stops?.length > 0 && (
        <Card className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-500 mb-3">{draft.stops.length} stops planned</p>
          <div className="flex flex-wrap gap-2">
            {draft.stops.map((s, i) => (
              <span key={s.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-2 dark:bg-surface-3 border border-[var(--border)] text-xs text-ink-700 dark:text-ink-300">
                <span className="w-4 h-4 rounded-full bg-brand-500 text-white text-[10px] flex items-center justify-center font-bold">{i+1}</span>
                {s.name}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Price breakdown */}
      {estimate && (
        <Card className="!p-0 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[var(--border)] flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
            <span className="text-xs font-semibold uppercase tracking-widest text-ink-500">Price Breakdown</span>
          </div>
          <div className="p-5 space-y-2.5">
            {rows.map(([l,v]) => (
              <div key={l} className="flex justify-between text-sm">
                <span className="text-ink-500">{l}</span>
                <span className="font-mono text-ink-800 dark:text-ink-200">{formatINR(v)}</span>
              </div>
            ))}
            <div className="flex justify-between text-xs text-ink-400 pt-1">
              <span>Demand multiplier</span><span>×{estimate.demandMult}</span>
            </div>
            <div className="h-px bg-[var(--border)] my-2" />
            <div className="flex justify-between font-semibold text-ink-900 dark:text-ink-100">
              <span>Estimated range</span>
              <span className="font-mono">{formatINR(estimate.estimatedMin)}–{formatINR(estimate.estimatedMax)}</span>
            </div>
            <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-900/15 border border-brand-200 dark:border-brand-800/40 flex items-center justify-between mt-2">
              <div>
                <p className="text-brand-700 dark:text-brand-400 font-bold text-sm">Due now — 30% advance</p>
                <p className="text-brand-600/70 dark:text-brand-500/70 text-xs mt-0.5">Remaining paid after ride completes</p>
              </div>
              <p className="font-display text-2xl font-bold text-gradient">{formatINR(estimate.advanceAmount)}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Payment method */}
      <Card className="!p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-500 mb-3">Payment method</p>
        <div className="space-y-2">
          {PAYMENT_METHODS.map(m => (
            <label key={m.id} className={`pay-method ${payMethod === m.id ? 'selected' : ''}`}>
              <input type="radio" name="payMethod" value={m.id} checked={payMethod === m.id} onChange={() => setPayMethod(m.id)} className="sr-only" />
              <span className="text-xl">{m.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">{m.label}</p>
                <p className="text-xs text-ink-400 mt-0.5">
                  {m.id === 'wallet' ? `Balance: ${formatINR(walletBalance)}` : m.sub}
                </p>
              </div>
              {payMethod === m.id && <Check className="w-4 h-4 text-brand-500" />}
            </label>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-[var(--border)] bg-surface-2/70 dark:bg-surface-3/50 p-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800/40 flex items-center justify-center text-brand-600 dark:text-brand-400 flex-shrink-0">
              <paymentMeta.Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">{paymentMeta.title}</p>
                {payMethod !== 'wallet' && <Badge variant="brand" size="xs">Razorpay</Badge>}
                {payMethod === 'wallet' && canUseWallet && <Badge variant="green" size="xs">Ready</Badge>}
                {payMethod === 'wallet' && !canUseWallet && <Badge variant="amber" size="xs">Low balance</Badge>}
              </div>
              <p className="mt-1 text-xs leading-5 text-ink-500 dark:text-ink-400">{paymentMeta.helper}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5">
              <p className="text-ink-400">Advance due</p>
              <p className="mt-1 font-mono font-bold text-ink-900 dark:text-ink-100">{formatINR(advanceAmount)}</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5">
              <p className="text-ink-400">{payMethod === 'wallet' ? 'Wallet balance' : 'Payment gateway'}</p>
              <p className="mt-1 font-semibold text-ink-900 dark:text-ink-100">
                {payMethod === 'wallet' ? formatINR(walletBalance) : 'Razorpay Secure'}
              </p>
            </div>
          </div>
          {payMethod === 'wallet' && !canUseWallet && (
            <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
              Your wallet needs {formatINR(Math.max(advanceAmount - walletBalance, 0))} more to continue with wallet payment.
            </p>
          )}
          {payMethod === 'upi' && upiApp && (
            <p className="mt-3 text-xs text-brand-600 dark:text-brand-400">
              Selected UPI app: {UPI_APPS.find((app) => app.id === upiApp)?.name || 'UPI'}
            </p>
          )}
        </div>

        {payMethod === 'upi' && (
          <div className="mt-3 pt-3 border-t border-[var(--border)]">
            <p className="text-xs text-ink-400 mb-2 font-medium">Select UPI app</p>
            <div className="grid grid-cols-3 gap-2">
              {UPI_APPS.map(app => (
                <button key={app.id} onClick={() => setUpiApp(app.id)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${upiApp === app.id ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400' : 'border-[var(--border)] text-ink-600 dark:text-ink-400 hover:border-[var(--border-strong)]'}`}>
                  {app.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-3 flex items-center gap-1.5 text-xs text-ink-400">
          <Shield className="w-3.5 h-3.5 text-green-500" />
          Secured by Razorpay · 256-bit SSL encrypted
        </div>
      </Card>

      <p className="text-xs text-ink-400 text-center leading-relaxed px-4">
        By confirming, you agree to our Terms of Service. Your guide will be notified and must accept within 2 hours. Full refund if declined.
      </p>

      <div className="flex justify-between gap-3 pt-1">
        <Button variant="ghost" onClick={() => dispatch(setStep(2))} icon={<ChevronLeft className="w-4 h-4" />}>Back</Button>
        <Button variant="primary" size="lg" loading={isBusy} onClick={handleConfirm} className="flex-1"
          disabled={(payMethod === 'wallet' && !canUseWallet) || (payMethod === 'upi' && !upiApp)}
          iconRight={<Check className="w-4 h-4" />}>
          {paymentMeta.cta} {estimate ? formatINR(estimate.advanceAmount) : '…'}
        </Button>
      </div>

      <Modal open={paymentModalOpen} onClose={() => {}} title="Payment in Progress" className="p-5" size="md">
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-2xl border border-brand-200 dark:border-brand-800/40 bg-brand-50/70 dark:bg-brand-900/15 p-4">
            <div className="w-11 h-11 rounded-2xl bg-brand-500 text-ink-900 flex items-center justify-center flex-shrink-0">
              <paymentMeta.Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">{paymentMeta.title}</p>
              <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
                {paymentStage === 'awaiting_payment'
                  ? 'Complete the payment in the Razorpay popup. Do not close this page.'
                  : 'We are processing your booking and payment securely.'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              ['creating_booking', 'Booking request created'],
              [payMethod === 'wallet' ? 'paying_with_wallet' : 'preparing_order', payMethod === 'wallet' ? 'Wallet debit started' : 'Razorpay order created'],
              [payMethod === 'wallet' ? 'idle' : 'awaiting_payment', payMethod === 'wallet' ? 'Wallet payment complete' : 'Waiting for checkout completion'],
              [payMethod === 'wallet' ? 'idle' : 'verifying_payment', payMethod === 'wallet' ? 'Verification complete' : 'Payment verification'],
            ].map(([stageKey, label]) => {
              const active =
                paymentStage === stageKey ||
                (stageKey === 'idle' && paymentStage === 'idle' && !isBusy);
              const completedStages = ['creating_booking', 'paying_with_wallet', 'preparing_order', 'awaiting_payment', 'verifying_payment'];
              const currentIndex = completedStages.indexOf(paymentStage);
              const stageIndex = completedStages.indexOf(stageKey);
              const completed = stageIndex !== -1 && currentIndex > stageIndex;

              return (
                <div key={label} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 ${
                    completed
                      ? 'bg-green-50 border-green-500 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                      : active
                        ? 'bg-brand-50 border-brand-500 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400'
                        : 'bg-[var(--surface)] border-[var(--border)] text-ink-400'
                  }`}>
                    {active ? <Loader2 className="w-4 h-4 animate-spin" /> : completed ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">•</span>}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink-900 dark:text-ink-100">{label}</p>
                    {active && <p className="text-xs text-ink-500 dark:text-ink-400">{paymentStageLabel}</p>}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-surface-2/70 dark:bg-surface-3/50 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-500">Advance payable now</span>
              <span className="font-mono font-bold text-ink-900 dark:text-ink-100">{formatINR(advanceAmount)}</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── Main Booking Page ──────────────────────────────────
export default function BookingPage() {
  const dispatch = useAppDispatch();
  const step     = useStep();

  useEffect(() => { dispatch(resetWizard()); }, [dispatch]);

  const stepContent = [<TripDetails />, <AddStops />, <ReviewPay />];

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <div className="text-xs tracking-[0.3em] text-brand-500 uppercase font-semibold mb-2">New booking</div>
          <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-ink-100">Plan your guided tour</h1>
          <p className="text-ink-400 mt-1">Find a verified local guide for an unforgettable city experience.</p>
        </div>
        <StepBar current={step} />
        {stepContent[step - 1]}
      </div>
    </PageWrapper>
  );
}
