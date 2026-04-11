export const genId=(p='id')=>`${p}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
export const sleep=ms=>new Promise(r=>setTimeout(r,ms));
export const genOTP=()=>String(Math.floor(1000+Math.random()*9000));

export const ls={
  get:(k,fb=null)=>{try{const v=localStorage.getItem(k);return v!==null?JSON.parse(v):fb;}catch{return fb;}},
  set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}},
  remove:k=>{try{localStorage.removeItem(k);}catch{}},
};

export const formatINR=n=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n||0);
export const formatDate=(s,opts={})=>{if(!s)return '';try{return new Date(s).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric',...opts});}catch{return s;}};
export const formatTime=s=>{if(!s)return '';try{const[h,m]=s.split(':');const hr=parseInt(h,10);return `${hr>12?hr-12:hr||12}:${m} ${hr>=12?'PM':'AM'}`;}catch{return s;}};
export const getTomorrow=()=>{const d=new Date();d.setDate(d.getDate()+1);return d.toISOString().split('T')[0];};

export const isValidEmail=v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
export const isValidPhone=v=>/^[6-9]\d{9}$/.test(v);
export const isValidName=v=>v&&v.trim().length>=2;
export const isValidPass=v=>v&&v.length>=8;

export const calcEstimate=({city,rideTypeId,hoursBooked=5})=>{
  if(!city)return null;
  const km={  '2hr':15,'5hr':35,fullday:70,custom:25}[rideTypeId]||30;
  const base=city.base,dist=Math.round(km*city.perKm),time=Math.round((hoursBooked||5)*city.perHour),guide=city.guideFee,d=city.demand;
  const sub=Math.round((base+dist+time+guide)*d),v=Math.round(sub*.15);
  return{baseFare:base,distanceCharge:dist,timeCharge:time,guideFee:guide,demandMult:d,subtotal:sub,estimatedMin:sub-v,estimatedMax:sub+v,advanceAmount:Math.round(sub*.3)};
};

export const createMockBooking=(draft,rider,estimate)=>{
  const user=ls.get('rwg_user');
  const b={id:genId('bkg'),tourist:user,rider,status:'confirmed',city:draft.city,date:draft.date,startTime:draft.startTime,endTime:draft.endTime,rideType:draft.rideType,pickupAddress:draft.pickupAddress,pickupLat:draft.pickupLat||null,pickupLng:draft.pickupLng||null,stops:draft.stops||[],genderPreference:draft.genderPreference,estimatedPrice:estimate,advancePaid:estimate?.advanceAmount||0,otp:genOTP(),createdAt:new Date().toISOString(),specialRequests:draft.specialRequests||'',paymentStatus:'paid',paymentId:genId('pay')};
  const ex=ls.get('rwg_bookings',[]);
  ls.set('rwg_bookings',[b,...ex]);
  return b;
};
