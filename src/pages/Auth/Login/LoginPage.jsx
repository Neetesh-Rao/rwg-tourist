import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, MessageSquareText, Phone, RotateCcw, ShieldCheck } from 'lucide-react';
import { useAppDispatch, useAuth } from '@/app/store/store';
import { setAuthSession } from '@/app/store/slices/authSlice';
import { useSendOtpMutation, useVerifyOtpMutation } from '@/app/store/slices/authApi';
import AuthLayout from '@/shared/layout/AuthLayout/AuthLayout';
import Button from '@/shared/ui/Button/Button';
import Input from '@/shared/ui/Input/Input';
import Divider from '@/shared/ui/Divider/Divider';
import OTPInput from '@/shared/ui/OTPInput/OTPInput';
import { genId, isValidPhone } from '@/shared/lib/helpers';

const OTP_LENGTH = 6;

const getApiMessage = (payload, fallback) =>
  payload?.message ||
  payload?.data?.message ||
  payload?.error ||
  payload?.data?.error ||
  fallback;

const buildUserFromResponse = (payload, phone) => {
  const user = payload?.user || payload?.data?.user || payload?.tourist || payload?.data?.tourist;
  if (user) return user;

  return {
    id: payload?.userId || payload?.data?.userId || genId('usr'),
    name: payload?.name || payload?.data?.name || 'Traveller',
    phone,
    email: payload?.email || payload?.data?.email || ''
  };
};

const getTokenFromResponse = (payload) =>
  payload?.token ||
  payload?.accessToken ||
  payload?.data?.token ||
  payload?.data?.accessToken ||
  genId('tok');

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation();
  const [verifyOtp, { isLoading: isVerifyingOtp }] = useVerifyOtpMutation();

  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [apiError, setApiError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const otpValue = useMemo(() => otp.join(''), [otp]);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const resetMessages = () => {
    setApiError('');
    setInfoMessage('');
  };

  const handlePhoneChange = (value) => {
    const next = value.replace(/\D/g, '').slice(0, 10);
    setPhone(next);
    setPhoneError('');
    resetMessages();
  };

  const handleOtpChange = (value) => {
    setOtp(value);
    setOtpError('');
    setApiError('');
  };

  async function handleSendOtp(e) {
    e.preventDefault();
    resetMessages();

    if (!isValidPhone(phone)) {
      setPhoneError('Enter a valid 10-digit Indian mobile number');
      return;
    }

    try {
      const payload = await sendOtp({ phone }).unwrap();
      setStep('otp');
      setOtp(Array(OTP_LENGTH).fill(''));
      setInfoMessage(getApiMessage(payload, `OTP sent to +91 ${phone}`));
    } catch (error) {
      setApiError(getApiMessage(error?.data, 'Could not send OTP. Please try again.'));
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    resetMessages();

    if (otpValue.length !== OTP_LENGTH) {
      setOtpError(`Enter the ${OTP_LENGTH}-digit OTP`);
      return;
    }

    try {
      const payload = await verifyOtp({ phone, otp: otpValue }).unwrap();
      const user = buildUserFromResponse(payload, phone);
      const token = getTokenFromResponse(payload);

      localStorage.setItem('token', token);
      dispatch(setAuthSession({ user, token }));
      navigate(user?.profileCompleted ? '/dashboard' : '/profile');
    } catch (error) {
      setApiError(getApiMessage(error?.data, 'OTP verification failed. Please try again.'));
    }
  }

  const isBusy = isSendingOtp || isVerifyingOtp;

  return (
    <AuthLayout
      title="Login with OTP"
      subtitle="Enter your mobile number, receive a one-time password, and verify it to continue."
    >
      <div className="mb-6 rounded-2xl border border-[var(--border)] bg-white/70 dark:bg-ink-900/40 backdrop-blur-sm p-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${step === 'phone' ? 'bg-brand-500 text-ink-900' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
            <Phone className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">Step 1</p>
            <p className="text-xs text-ink-500 dark:text-ink-400">Enter your mobile number to request OTP.</p>
          </div>
        </div>

        <div className="my-4 h-px bg-[var(--border)]" />

        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${step === 'otp' ? 'bg-brand-500 text-ink-900' : 'bg-surface-2 dark:bg-surface-3 text-ink-500 dark:text-ink-400'}`}>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">Step 2</p>
            <p className="text-xs text-ink-500 dark:text-ink-400">Verify the OTP to complete login.</p>
          </div>
        </div>
      </div>

      {apiError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {apiError}
        </div>
      )}

      {infoMessage && (
        <div className="mb-4 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700 dark:border-brand-800 dark:bg-brand-900/20 dark:text-brand-300">
          {infoMessage}
        </div>
      )}

      {step === 'phone' ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <Input
            label="Mobile number"
            type="tel"
            inputMode="numeric"
            placeholder="9876543210"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            error={phoneError}
            leftIcon={<Phone className="w-4 h-4" />}
            required
            hint="We will send a one-time password to this number."
          />

          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-surface-2/70 dark:bg-surface-3/50 p-4">
            <div className="flex items-start gap-3">
              <MessageSquareText className="w-4 h-4 text-brand-500 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">Quick login</p>
                <p className="mt-1 text-xs leading-5 text-ink-500 dark:text-ink-400">
                  No password needed. Just verify the OTP and continue to your dashboard.
                </p>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isSendingOtp}
            iconRight={<ChevronRight className="w-4 h-4" />}
          >
            Send OTP
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <div className="rounded-2xl border border-[var(--border)] bg-surface-2/70 dark:bg-surface-3/50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-ink-400">Mobile number</p>
            <div className="mt-2 flex items-center justify-between gap-4">
              <p className="text-lg font-semibold text-ink-900 dark:text-ink-100">+91 {phone}</p>
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setOtp(Array(OTP_LENGTH).fill(''));
                  resetMessages();
                }}
                className="text-sm font-medium text-brand-500 hover:text-brand-600"
              >
                Change
              </button>
            </div>
          </div>

          <div>
            <label className="mb-3 block text-xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">
              Enter OTP
            </label>
            <OTPInput length={OTP_LENGTH} value={otp} onChange={handleOtpChange} />
            {otpError && <p className="mt-2 text-xs text-red-500 dark:text-red-400">{otpError}</p>}
          </div>

          <div className="flex gap-3">
            <Button type="submit" variant="primary" size="lg" loading={isVerifyingOtp} className="flex-1">
              Verify OTP
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="flex-1"
              loading={isSendingOtp}
              disabled={isBusy}
              icon={<RotateCcw className="w-4 h-4" />}
              onClick={async () => {
                try {
                  resetMessages();
                  const payload = await sendOtp({ phone }).unwrap();
                  setInfoMessage(getApiMessage(payload, `OTP resent to +91 ${phone}`));
                } catch (error) {
                  setApiError(getApiMessage(error?.data, 'Could not resend OTP. Please try again.'));
                }
              }}
            >
              Resend OTP
            </Button>
          </div>
        </form>
      )}

      <Divider label="New to Ride with Guide?" className="mt-6" />
      <Link to="/register">
        <Button variant="secondary" size="lg" fullWidth>Create a free account</Button>
      </Link>
    </AuthLayout>
  );
}
