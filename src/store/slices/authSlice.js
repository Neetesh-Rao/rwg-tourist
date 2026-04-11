import{createSlice,createAsyncThunk}from'@reduxjs/toolkit';
import{ls,genId,sleep}from'../../utils/helpers';

export const registerUser=createAsyncThunk('auth/register',async(data,{rejectWithValue})=>{
  try{
    await sleep(1000);
    // TODO: const res = await axios.post('/api/v1/auth/register', data);
    const user={id:genId('usr'),name:data.name,email:data.email,phone:data.phone,nationality:data.nationality,preferredLanguage:data.preferredLanguage,gender:data.gender,avatar:null,bio:'',totalTrips:0,walletBalance:500,joinedAt:new Date().toISOString()};
    const token=genId('tok');
    ls.set('rwg_token',token);ls.set('rwg_user',user);
    return{user,token};
  }catch(e){return rejectWithValue(e?.response?.data?.message||'Registration failed. Try again.');}
});

export const loginUser=createAsyncThunk('auth/login',async(data,{rejectWithValue})=>{
  try{
    await sleep(800);
    // TODO: const res = await axios.post('/api/v1/auth/login', data);
    const stored=ls.get('rwg_user');
    if(!stored)return rejectWithValue('No account found. Please register first.');
    const token=genId('tok');ls.set('rwg_token',token);
    return{user:stored,token};
  }catch(e){return rejectWithValue(e?.response?.data?.message||'Login failed. Try again.');}
});

export const updateProfile=createAsyncThunk('auth/updateProfile',async(data,{rejectWithValue,getState})=>{
  try{
    await sleep(600);
    // TODO: const res = await axios.put('/api/v1/auth/profile', data);
    const updated={...getState().auth.user,...data};
    ls.set('rwg_user',updated);return updated;
  }catch(e){return rejectWithValue('Profile update failed.');}
});

const authSlice=createSlice({
  name:'auth',
  initialState:{
    user:ls.get('rwg_user'),token:ls.get('rwg_token'),
    isAuthenticated:!!(ls.get('rwg_token')&&ls.get('rwg_user')),
    isLoading:false,error:null,
  },
  reducers:{
    logout:s=>{s.user=null;s.token=null;s.isAuthenticated=false;ls.remove('rwg_token');ls.remove('rwg_user');},
    clearError:s=>{s.error=null;},
    creditWallet:(s,{payload})=>{if(s.user){s.user.walletBalance=(s.user.walletBalance||0)+payload;ls.set('rwg_user',s.user);}},
    debitWallet:(s,{payload})=>{if(s.user){s.user.walletBalance=Math.max(0,(s.user.walletBalance||0)-payload);ls.set('rwg_user',s.user);}},
  },
  extraReducers:b=>{
    const P=s=>{s.isLoading=true;s.error=null;};
    const R=(s,a)=>{s.isLoading=false;s.error=a.payload;};
    b.addCase(registerUser.pending,P).addCase(registerUser.fulfilled,(s,{payload})=>{s.isLoading=false;s.user=payload.user;s.token=payload.token;s.isAuthenticated=true;}).addCase(registerUser.rejected,R)
     .addCase(loginUser.pending,P).addCase(loginUser.fulfilled,(s,{payload})=>{s.isLoading=false;s.user=payload.user;s.token=payload.token;s.isAuthenticated=true;}).addCase(loginUser.rejected,R)
     .addCase(updateProfile.pending,P).addCase(updateProfile.fulfilled,(s,{payload})=>{s.isLoading=false;s.user=payload;}).addCase(updateProfile.rejected,R);
  },
});
export const{logout,clearError,creditWallet,debitWallet}=authSlice.actions;
export default authSlice.reducer;
