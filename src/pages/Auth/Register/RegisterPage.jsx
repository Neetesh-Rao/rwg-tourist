import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff, ChevronRight } from 'lucide-react';
import { useAppDispatch, useAuth } from '@/app/store/store';
import { registerUser, clearError } from '@/features/auth/model/authSlice';
import AuthLayout from '@/shared/layout/AuthLayout/AuthLayout';
import Button from '@/shared/ui/Button/Button';
import Input from '@/shared/ui/Input/Input';
import Select from '@/shared/ui/Select/Select';
import Divider from '@/shared/ui/Divider/Divider';
import { LANGUAGES, NATIONALITIES } from '@/shared/config/constants';
import { isValidEmail, isValidPhone, isValidName, isValidPass } from '@/shared/lib/helpers';

const STEPS = ['Your info', 'Preferences'];
const GENDER_OPTS = [
  { value: 'female',           label: 'Female' },
  { value: 'male',             label: 'Male' },
  { value: 'prefer_not_to_say',label: 'Prefer not to say' },
];

export default function RegisterPage() {
  const dispatch   = useAppDispatch();
  const navigate   = useNavigate();
  const { isAuthenticated, isLoading, error } = useAuth();

  const [step,     setStep]    = useState(1);
  const [showPwd,  setShowPwd] = useState(false);
  const [errs,     setErrs]    = useState({});
  const [form,     setForm]    = useState({
    name: '', email: '', phone: '', password: '', confirm: '',
    nationality: 'Indian', preferredLanguage: 'English', gender: 'prefer_not_to_say',
  });

  useEffect(() => { if (isAuthenticated) navigate('/dashboard'); }, [isAuthenticated, navigate]);
  useEffect(() => () => { dispatch(clearError()); }, [dispatch]);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrs(e => ({ ...e, [k]: '' })); };

  function validateStep1() {
    const e = {};
    if (!isValidName(form.name))   e.name     = 'Enter your full name (min 2 chars)';
    if (!isValidEmail(form.email)) e.email    = 'Enter a valid email address';
    if (!isValidPhone(form.phone)) e.phone    = 'Enter a valid 10-digit Indian mobile number';
    if (!isValidPass(form.password)) e.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  }

  function handleStep1(e) {
    e.preventDefault();
    const errs = validateStep1();
    if (Object.keys(errs).length) { setErrs(errs); return; }
    setStep(2);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const { confirm, ...rest } = form;
    dispatch(registerUser(rest));
  }

  return (
    <AuthLayout title="Create your account" subtitle="Start exploring cities with verified local guides.">
      {/* Step pills */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              step === i + 1 ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400'
              : step > i + 1 ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
              : 'text-ink-400'
            }`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === i+1 ? 'bg-brand-500 text-white' : step > i+1 ? 'bg-green-500 text-white' : 'bg-surface-3 text-ink-400'
              }`}>{step > i+1 ? '✓' : i+1}</span>
              {s}
            </div>
            {i < STEPS.length - 1 && <div className="flex-1 h-px bg-[var(--border)]" />}
          </React.Fragment>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400 animate-fade-in">
          {error}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleStep1} className="space-y-4">
          <Input label="Full name" placeholder="Your full name" required leftIcon={<User className="w-4 h-4" />}
            value={form.name} onChange={e => set('name', e.target.value)} error={errs.name} />

          <div className="grid grid-cols-2 gap-3">
            <Input label="Email" type="email" placeholder="you@email.com" required leftIcon={<Mail className="w-4 h-4" />}
              value={form.email} onChange={e => set('email', e.target.value)} error={errs.email} />
            <Input label="Phone" type="tel" placeholder="9876543210" required leftIcon={<Phone className="w-4 h-4" />}
              value={form.phone} onChange={e => set('phone', e.target.value)} error={errs.phone} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Password" type={showPwd ? 'text' : 'password'} placeholder="Min. 8 chars" required
              leftIcon={<Lock className="w-4 h-4" />} error={errs.password}
              value={form.password} onChange={e => set('password', e.target.value)}
              rightElement={
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-ink-400 hover:text-ink-600 transition-colors">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
            <Input label="Confirm" type={showPwd ? 'text' : 'password'} placeholder="Repeat" required
              leftIcon={<Lock className="w-4 h-4" />} error={errs.confirm}
              value={form.confirm} onChange={e => set('confirm', e.target.value)} />
          </div>

          <Button type="submit" variant="primary" size="lg" fullWidth iconRight={<ChevronRight className="w-4 h-4" />}>
            Continue
          </Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select label="Nationality" required
              options={NATIONALITIES.map(n => ({ value: n, label: n }))}
              value={form.nationality} onChange={e => set('nationality', e.target.value)} />
            <Select label="Preferred language" required
              options={LANGUAGES.map(l => ({ value: l, label: l }))}
              value={form.preferredLanguage} onChange={e => set('preferredLanguage', e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">
              Gender <span className="text-ink-300 normal-case tracking-normal font-normal">(for guide matching)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {GENDER_OPTS.map(opt => (
                <label key={opt.value}
                  className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                    form.gender === opt.value ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20' : 'border-[var(--border-md)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <input type="radio" name="gender" value={opt.value} checked={form.gender === opt.value}
                    onChange={() => set('gender', opt.value)} className="accent-brand-500 w-3.5 h-3.5" />
                  <span className="text-xs text-ink-700 dark:text-ink-300">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" size="lg" onClick={() => setStep(1)}>Back</Button>
            <Button type="submit" variant="primary" size="lg" loading={isLoading} fullWidth
              iconRight={<ChevronRight className="w-4 h-4" />}>
              Create account
            </Button>
          </div>
        </form>
      )}

      <Divider label="Already have an account?" className="mt-6" />
      <Link to="/login">
        <Button variant="secondary" size="lg" fullWidth>Sign in instead</Button>
      </Link>
    </AuthLayout>
  );
}
