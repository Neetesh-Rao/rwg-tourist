import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ChevronRight } from 'lucide-react';
import { useAppDispatch, useAuth } from '@/app/store/store';
import { loginUser, clearError } from '@/features/auth/model/authSlice';
import AuthLayout from '@/shared/layout/AuthLayout/AuthLayout';
import Button from '@/shared/ui/Button/Button';
import Input from '@/shared/ui/Input/Input';
import Divider from '@/shared/ui/Divider/Divider';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error } = useAuth();
  const [showPwd, setShowPwd] = useState(false);
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [errs,    setErrs]    = useState({});

  useEffect(() => { if (isAuthenticated) navigate('/dashboard'); }, [isAuthenticated, navigate]);
  useEffect(() => () => { dispatch(clearError()); }, [dispatch]);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrs(e => ({ ...e, [k]: '' })); };

  function handleSubmit(e) {
    e.preventDefault();
    const ne = {};
    if (!form.email)    ne.email    = 'Enter your email';
    if (!form.password) ne.password = 'Enter your password';
    if (Object.keys(ne).length) { setErrs(ne); return; }
    dispatch(loginUser(form));
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to manage your guided tours across India.">
      {error && (
        <div className="mb-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400 animate-fade-in">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email" type="email" placeholder="you@email.com" required
          leftIcon={<Mail className="w-4 h-4" />}
          value={form.email} onChange={e => set('email', e.target.value)} error={errs.email}
        />
        <Input
          label="Password" type={showPwd ? 'text' : 'password'} placeholder="Your password" required
          leftIcon={<Lock className="w-4 h-4" />}
          value={form.password} onChange={e => set('password', e.target.value)} error={errs.password}
          rightElement={
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-ink-400 hover:text-ink-600 transition-colors">
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />

        <div className="flex justify-end">
          <button type="button" className="text-xs text-brand-500 hover:text-brand-600 font-medium transition-colors">
            Forgot password?
          </button>
        </div>

        <Button type="submit" variant="primary" size="lg" fullWidth loading={isLoading}
          iconRight={<ChevronRight className="w-4 h-4" />}>
          Sign in
        </Button>
      </form>

      <Divider label="New to Ride with Guide?" className="mt-6" />
      <Link to="/register">
        <Button variant="secondary" size="lg" fullWidth>Create a free account</Button>
      </Link>
    </AuthLayout>
  );
}
