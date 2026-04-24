import{createSlice,createAsyncThunk}from'@reduxjs/toolkit';
import{ls,sleep,genId}from'@/shared/lib/helpers';
import{creditWallet}from'./authSlice';

const initTheme=()=>{const s=ls.get('rwg_theme','light');if(s==='dark')document.documentElement.classList.add('dark');return s;};

export const uiSlice=createSlice({
  name:'ui',
  initialState:{theme:initTheme(),modal:null,toasts:[],sidebarOpen:false},
  reducers:{
    toggleTheme:s=>{const n=s.theme==='light'?'dark':'light';s.theme=n;ls.set('rwg_theme',n);n==='dark'?document.documentElement.classList.add('dark'):document.documentElement.classList.remove('dark');},
    setTheme:(s,a)=>{s.theme=a.payload;ls.set('rwg_theme',a.payload);a.payload==='dark'?document.documentElement.classList.add('dark'):document.documentElement.classList.remove('dark');},
    openModal:(s,a)=>{s.modal=a.payload;},
    closeModal:s=>{s.modal=null;},
    pushToast:(s,a)=>{s.toasts.push({id:Date.now().toString()+Math.random().toString(36).slice(2),type:'info',duration:4000,...a.payload});},
    popToast:(s,a)=>{s.toasts=s.toasts.filter(t=>t.id!==a.payload);},
  },
});
export const{toggleTheme,setTheme,openModal,closeModal,pushToast,popToast}=uiSlice.actions;

export const addMoney=createAsyncThunk('wallet/add',async({amount,method},{dispatch,rejectWithValue})=>{
  try{
    await sleep(1500);
    const txn={id:genId('txn'),type:'credit',amount,method,status:'success',createdAt:new Date().toISOString(),description:`Added via ${method}`};
    dispatch(creditWallet(amount));
    const ex=ls.get('rwg_wallet_txns',[]);ls.set('rwg_wallet_txns',[txn,...ex]);
    return txn;
  }catch{return rejectWithValue('Payment failed. Please try again.');}
});

export const loadWalletTxns=createAsyncThunk('wallet/loadTxns',async()=>{
  await sleep(200);
  return ls.get('rwg_wallet_txns',[
    {id:'txn_w1',type:'credit',amount:500,method:'welcome_bonus',status:'success',createdAt:new Date(Date.now()-864e5*3).toISOString(),description:'Welcome bonus 🎉'},
    {id:'txn_w2',type:'debit',amount:450,method:'booking',status:'success',createdAt:new Date(Date.now()-864e5*2).toISOString(),description:'Jaipur tour advance'},
  ]);
});

export const walletSlice=createSlice({
  name:'wallet',
  initialState:{transactions:[],isLoading:false,error:null},
  reducers:{clearWalletError:s=>{s.error=null;}},
  extraReducers:b=>{
    b.addCase(addMoney.pending,s=>{s.isLoading=true;s.error=null;})
     .addCase(addMoney.fulfilled,(s,a)=>{s.isLoading=false;s.transactions.unshift(a.payload);})
     .addCase(addMoney.rejected,(s,a)=>{s.isLoading=false;s.error=a.payload;})
     .addCase(loadWalletTxns.fulfilled,(s,a)=>{s.transactions=a.payload;});
  },
});
export const{clearWalletError}=walletSlice.actions;
