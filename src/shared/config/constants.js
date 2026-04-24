export const CITIES = [
  {id:'jaipur',  name:'Jaipur',  tagline:'The Pink City',      lat:26.9124,lng:75.7873,base:80, perKm:14,perHour:120,guideFee:250,demand:1.1 },
  {id:'delhi',   name:'Delhi',   tagline:'The Capital',         lat:28.6139,lng:77.2090,base:100,perKm:16,perHour:150,guideFee:300,demand:1.2 },
  {id:'agra',    name:'Agra',    tagline:'City of Taj Mahal',  lat:27.1767,lng:78.0081,base:80, perKm:13,perHour:110,guideFee:250,demand:1.15},
  {id:'goa',     name:'Goa',     tagline:'Pearl of Orient',    lat:15.2993,lng:74.1240,base:90, perKm:15,perHour:130,guideFee:280,demand:1.3 },
  {id:'mumbai',  name:'Mumbai',  tagline:'City of Dreams',     lat:19.0760,lng:72.8777,base:120,perKm:18,perHour:180,guideFee:350,demand:1.25},
  {id:'udaipur', name:'Udaipur', tagline:'City of Lakes',      lat:24.5854,lng:73.7125,base:75, perKm:12,perHour:100,guideFee:220,demand:1.05},
  {id:'varanasi',name:'Varanasi',tagline:'Spiritual Capital',  lat:25.3176,lng:82.9739,base:70, perKm:11,perHour:95, guideFee:200,demand:1.0 },
  {id:'mysore',  name:'Mysore',  tagline:'City of Palaces',    lat:12.2958,lng:76.6394,base:75, perKm:12,perHour:100,guideFee:210,demand:1.0 },
];
export const getCityById = id => CITIES.find(c=>c.id===id)||CITIES[0];

export const RIDE_TYPES=[
  {id:'2hr',    label:'2-Hour',  sub:'City Highlights',hours:2,emoji:'⚡',desc:'Quick iconic spots'},
  {id:'5hr',    label:'Half Day',sub:'5 Hours',        hours:5,emoji:'🗺', desc:'Best of the city'},
  {id:'fullday',label:'Full Day',sub:'8 Hours',        hours:8,emoji:'🌟',desc:'Deep-dive experience'},
  {id:'custom', label:'Custom',  sub:'Your schedule',  hours:0,emoji:'✦', desc:'Build your itinerary'},
];

export const LANGUAGES=['English','Hindi','Bengali','Tamil','Telugu','Marathi','Gujarati','Punjabi','Rajasthani','French','German','Japanese','Chinese','Spanish','Italian','Russian','Korean'];
export const NATIONALITIES=['Indian','American','British','Australian','Canadian','French','German','Japanese','Chinese','Korean','Russian','Italian','Spanish','Brazilian','Mexican','Dutch','Swedish','Singaporean','UAE / Emirati','South African'];

export const PAYMENT_METHODS=[
  {id:'upi',    label:'UPI',                sub:'PhonePe · GPay · Paytm · BHIM',icon:'⚡'},
  {id:'card',   label:'Credit/Debit Card',  sub:'Visa · Mastercard · RuPay',    icon:'💳'},
  {id:'wallet', label:'RwG Wallet',         sub:'Instant · Zero charges',        icon:'👜'},
  {id:'netbank',label:'Net Banking',        sub:'All major Indian banks',         icon:'🏦'},
];
export const UPI_APPS=[
  {id:'phonepe',name:'PhonePe',color:'#5f259f'},{id:'gpay',name:'GPay',color:'#4285F4'},
  {id:'paytm',  name:'Paytm',  color:'#002970'},{id:'bhim',name:'BHIM',color:'#00529B'},
  {id:'navi',   name:'Navi',   color:'#E63838'},{id:'other',name:'Other UPI',color:'#6B7280'},
];

export const BOOKING_STATUS={
  pending:    {label:'Pending',    color:'amber', dot:'#D97706'},
  confirmed:  {label:'Confirmed',  color:'green', dot:'#16A34A'},
  ongoing:    {label:'Ongoing',    color:'brand', dot:'#F59000'},
  completed:  {label:'Completed',  color:'neutral',dot:'#9B9890'},
  cancelled:  {label:'Cancelled',  color:'red',   dot:'#DC2626'},
};

export const CITY_STOPS={
  jaipur:[
    {name:'Amber Fort',    duration:90, category:'Heritage',lat:26.9855,lng:75.8513},
    {name:'Hawa Mahal',    duration:45, category:'Monument',lat:26.9239,lng:75.8267},
    {name:'City Palace',   duration:75, category:'Royal',   lat:26.9258,lng:75.8237},
    {name:'Jantar Mantar', duration:45, category:'Science', lat:26.9247,lng:75.8237},
    {name:'Nahargarh Fort',duration:60, category:'Heritage',lat:26.9448,lng:75.8024},
    {name:'Johri Bazaar',  duration:60, category:'Shopping',lat:26.9168,lng:75.8258},
    {name:'Jal Mahal',     duration:30, category:'Scenic',  lat:26.9508,lng:75.8413},
  ],
  delhi:[
    {name:'Red Fort',      duration:90, category:'Heritage', lat:28.6562,lng:77.2410},
    {name:'India Gate',    duration:45, category:'Monument', lat:28.6129,lng:77.2295},
    {name:'Qutub Minar',   duration:60, category:'Heritage', lat:28.5245,lng:77.1855},
    {name:"Humayun's Tomb",duration:60, category:'Mughal',   lat:28.5933,lng:77.2507},
    {name:'Chandni Chowk', duration:90, category:'Market',   lat:28.6505,lng:77.2303},
    {name:'Lotus Temple',  duration:45, category:'Spiritual',lat:28.5535,lng:77.2588},
  ],
  agra:[
    {name:'Taj Mahal',     duration:120,category:'Wonder',  lat:27.1751,lng:78.0421},
    {name:'Agra Fort',     duration:90, category:'Heritage',lat:27.1800,lng:78.0219},
    {name:'Mehtab Bagh',   duration:45, category:'Garden',  lat:27.1759,lng:78.0344},
    {name:'Fatehpur Sikri',duration:90, category:'Heritage',lat:27.0945,lng:77.6601},
  ],
  goa:[
    {name:'Baga Beach',      duration:90, category:'Beach',  lat:15.5557,lng:73.7523},
    {name:'Old Goa Churches',duration:60, category:'Heritage',lat:15.5009,lng:73.9118},
    {name:'Anjuna Market',   duration:75, category:'Market', lat:15.5803,lng:73.7450},
    {name:'Chapora Fort',    duration:45, category:'Fort',   lat:15.6094,lng:73.7380},
  ],
};

export const MOCK_RIDERS=[
  {id:'rid_001',name:'Priya Sharma', gender:'female',rating:4.9,totalRides:312,languages:['Hindi','English','Rajasthani'],city:'jaipur',vehicleType:'Sedan',    vehicleNumber:'RJ14 CD 5678',guideExpertise:['Heritage','Local Food','Photography'],bio:'Born and raised in Jaipur — I know every hidden lane, untold story, and secret spot of the Pink City.',pricePerHour:120,pricePerKm:14,isOnline:true, lat:26.9024,lng:75.8073,completionRate:98,responseTime:'< 5 min'},
  {id:'rid_002',name:'Mehul Verma',  gender:'male',  rating:4.7,totalRides:187,languages:['Hindi','English','Gujarati'],  city:'jaipur',vehicleType:'SUV',       vehicleNumber:'RJ14 AB 1234',guideExpertise:['Architecture','History','Trekking'],  bio:'Former archaeologist turned guide. I bring centuries of history alive before your eyes.',             pricePerHour:135,pricePerKm:15,isOnline:true, lat:26.9224,lng:75.7673,completionRate:95,responseTime:'< 10 min'},
  {id:'rid_003',name:'Anita Meena',  gender:'female',rating:4.8,totalRides:254,languages:['Hindi','English','French','German'],city:'jaipur',vehicleType:'Hatchback',vehicleNumber:'RJ14 EF 9012',guideExpertise:['Temples','Markets','Culture'],       bio:'Ex-tourism officer. 4 languages, 8 years expertise. I create journeys, not just tours.',               pricePerHour:115,pricePerKm:13,isOnline:false,lat:26.8924,lng:75.7973,completionRate:97,responseTime:'< 8 min'},
];
