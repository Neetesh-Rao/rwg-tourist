import{createSlice,createAsyncThunk}from'@reduxjs/toolkit';
import{ls,sleep,calcEstimate,createMockBooking,genId}from'@/shared/lib/helpers';
import{MOCK_RIDERS,getCityById}from'@/shared/config/constants';

export const fetchSlots=createAsyncThunk('booking/fetchSlots',async(params,{rejectWithValue})=>{
  try{
    await sleep(900);
    let riders=[...MOCK_RIDERS];
    if(params.genderPreference==='female_first') riders.sort((a,b)=>a.gender==='female'?-1:1);
    else if(params.genderPreference==='male_first') riders.sort((a,b)=>a.gender==='male'?-1:1);
    return riders.map((rider,i)=>({id:genId('slot'),riderId:rider.id,rider,city:params.city,date:params.date,startTime:params.startTime||'08:00',endTime:params.endTime||'20:00',status:'available'}));
  }catch{return rejectWithValue('Could not load guides. Please try again.');}
});

export const estimatePrice=createAsyncThunk('booking/estimatePrice',async(params)=>{
  await sleep(200);
  const city=getCityById(params.cityId);
  return calcEstimate({city,rideTypeId:params.rideTypeId,hoursBooked:params.hoursBooked});
});

export const createBooking=createAsyncThunk('booking/create',async(_,{rejectWithValue,getState})=>{
  try{
    await sleep(1400);
    const{draft,selectedSlot,priceEstimate}=getState().booking;
    return createMockBooking(draft,selectedSlot?.rider,priceEstimate);
  }catch{return rejectWithValue('Booking failed. Please try again.');}
});

export const loadMyBookings=createAsyncThunk('booking/loadMine',async()=>{
  await sleep(300);
  return ls.get('rwg_bookings',[]);
});

const bookingSlice=createSlice({
  name:'booking',
  initialState:{
    step:1,draft:{stops:[]},availableSlots:[],selectedSlot:null,
    priceEstimate:null,bookings:[],currentBooking:null,
    activeRide:null,isLoading:false,error:null,
  },
  reducers:{
    setStep:(s,a)=>{s.step=a.payload;},
    updateDraft:(s,a)=>{s.draft={...s.draft,...a.payload};},
    selectSlot:(s,a)=>{s.selectedSlot=a.payload;},
    setBookings:(s,a)=>{s.bookings=a.payload||[];},
    bookingCreated:(s,a)=>{s.currentBooking=a.payload;s.bookings.unshift(a.payload);},
    addStop:(s,a)=>{if(!s.draft.stops)s.draft.stops=[];s.draft.stops.push(a.payload);},
    removeStop:(s,a)=>{s.draft.stops=s.draft.stops.filter(st=>st.id!==a.payload);},
    resetWizard:s=>{s.step=1;s.draft={stops:[]};s.availableSlots=[];s.selectedSlot=null;s.priceEstimate=null;s.error=null;},
    startRide:(s,a)=>{s.activeRide=a.payload;},
    endRide:s=>{s.activeRide=null;},
    clearError:s=>{s.error=null;},
  },
  extraReducers:b=>{
    b.addCase(fetchSlots.pending,s=>{s.isLoading=true;s.error=null;})
     .addCase(fetchSlots.fulfilled,(s,a)=>{s.isLoading=false;s.availableSlots=a.payload;})
     .addCase(fetchSlots.rejected,(s,a)=>{s.isLoading=false;s.error=a.payload;})
     .addCase(estimatePrice.fulfilled,(s,a)=>{s.priceEstimate=a.payload;})
     .addCase(createBooking.pending,s=>{s.isLoading=true;s.error=null;})
     .addCase(createBooking.fulfilled,(s,a)=>{s.isLoading=false;s.currentBooking=a.payload;s.bookings.unshift(a.payload);})
     .addCase(createBooking.rejected,(s,a)=>{s.isLoading=false;s.error=a.payload;})
     .addCase(loadMyBookings.fulfilled,(s,a)=>{s.bookings=a.payload;});
  },
});
export const{setStep,updateDraft,selectSlot,setBookings,bookingCreated,addStop,removeStop,resetWizard,startRide,endRide,clearError}=bookingSlice.actions;
export default bookingSlice.reducer;
