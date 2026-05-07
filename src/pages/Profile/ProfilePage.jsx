import React, { useEffect, useState } from 'react';
import { Camera } from 'lucide-react';
import { useAppDispatch, useUser, useAuth } from '@/app/store/store';
import { setAuthSession } from '@/app/store/slices/authSlice';
import { useGetProfileQuery, useUpdateProfileMutation } from '@/app/store/slices/authApi';
import { pushToast } from '@/app/store/slices/uiWalletSlice';
import PageWrapper from '@/shared/layout/PageWrapper/PageWrapper';
import Button from '@/shared/ui/Button/Button';
import Card from '@/shared/ui/Card/Card';
import Input2 from '@/shared/ui/Input/Input';
import Select2 from '@/shared/ui/Select/Select';
import Avatar from '@/shared/ui/Avatar/Avatar';
import Modal from '@/shared/ui/Modal/Modal';
import {
  LANGUAGES as LANGS,
  NATIONALITIES as NATS,
} from '@/shared/config/constants';

const PROFILE_GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Prefer_not_to_say', label: 'Prefer not to say' },
];

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const user = useUser();
  const { token } = useAuth();
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);

  const { data: profileResponse, isLoading: isProfileLoading, isFetching: isProfileFetching } = useGetProfileQuery(undefined, {
    skip: !token,
    refetchOnMountOrArgChange: true,
  });

  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    nationality: user?.nationality || 'Indian',
    preferredLanguage: user?.preferredLanguage || 'English',
    gender: user?.gender || 'Prefer_not_to_say',
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    const profileUser = profileResponse?.data || profileResponse?.user || profileResponse;
    if (profileUser && token) {
      dispatch(setAuthSession({ user: { ...user, ...profileUser }, token }));
    }
  }, [dispatch, profileResponse, token]);

  useEffect(() => {
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      bio: user?.bio || '',
      nationality: user?.nationality || 'Indian',
      preferredLanguage: user?.preferredLanguage || 'English',
      gender: user?.gender || 'Prefer_not_to_say',
    });
  }, [user]);

  useEffect(() => {
    if (user && user.profileCompleted === false) setShowProfilePrompt(true);
  }, [user]);

  async function handleSave(e) {
    e.preventDefault();
    try {
      const response = await updateProfile(form).unwrap();
      const updatedUser = response?.data || response?.user || response;
      dispatch(setAuthSession({ user: { ...user, ...updatedUser }, token }));
      dispatch(pushToast({ type: 'success', title: 'Profile updated!', message: 'Saved successfully.' }));
    } catch (error) {
      dispatch(pushToast({ type: 'error', title: 'Update failed', message: error?.data?.message || 'Try again.' }));
    }
  }

  async function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      const response = await updateProfile(formData).unwrap();
      const updatedUser = response?.data || response;
      dispatch(setAuthSession({ user: { ...user, ...updatedUser }, token }));
      dispatch(pushToast({ type: 'success', title: 'Photo updated!', message: 'Uploaded successfully.' }));
    } catch (error) {
      dispatch(pushToast({ type: 'error', title: 'Upload failed', message: error?.data?.message || 'Try again.' }));
    }
  }

  const isLoading = isUpdatingProfile || isProfileLoading || isProfileFetching;

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <div className="text-xs tracking-[0.3em] text-brand-500 uppercase font-semibold mb-2">Account</div>
          <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-ink-100">Your Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-1 flex flex-col gap-6 h-full">
            <Card className="!p-6 text-center">
              <div className="relative w-fit mx-auto mb-4">
                <Avatar name={user?.name} src={user?.profileImage} size="2xl" />
                <label className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center cursor-pointer shadow-lg">
                  <Camera className="w-5 h-5" />
                  <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                </label>
              </div>

              <h2 className="font-display text-xl font-bold">{user?.name}</h2>
              <p className="text-sm text-ink-400 mt-1">{user?.email}</p>

              <div className="flex items-center justify-center gap-4 mt-4 text-sm">
                <span>{user?.totalTrips || 0} trips</span>
                <span className="w-1 h-1 rounded-full bg-ink-300" />
                <span className="text-brand-500 font-semibold">₹{(user?.walletBalance || 0).toLocaleString('en-IN')}</span>
              </div>
            </Card>

            <Card className="!p-6 flex-1 flex flex-col justify-center">
              <h3 className="font-display text-base font-bold mb-4">Account Info</h3>
              <div className="space-y-3 text-sm">
                {[
                  ['Email', user?.email],
                  ['Phone', user?.phone],
                  ['Gender', user?.gender],
                  ['Member Since', new Date(user?.joinedAt || Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 py-2 border-b border-[var(--border)] last:border-0">
                    <span className="text-ink-500">{k}</span>
                    <span className="font-medium capitalize">{v || '-'}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2 h-full">
            <Card className="!p-6 h-full flex flex-col justify-center">
              <h3 className="font-display text-lg font-bold mb-5">Edit Details</h3>
              <form onSubmit={handleSave} className="space-y-4">
                <Input2 label="Full name" value={form.name} onChange={(e) => set('name', e.target.value)} />
                <Input2 label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Select2 label="Nationality" options={NATS.map((n) => ({ value: n, label: n }))} value={form.nationality} onChange={(e) => set('nationality', e.target.value)} />
                  <Select2 label="Language" options={LANGS.map((l) => ({ value: l, label: l }))} value={form.preferredLanguage} onChange={(e) => set('preferredLanguage', e.target.value)} />
                </div>

                <Select2 label="Gender" options={PROFILE_GENDER_OPTIONS} value={form.gender} onChange={(e) => set('gender', e.target.value)} />

                <textarea rows={4} value={form.bio} onChange={(e) => set('bio', e.target.value)} placeholder="Tell about yourself" className="input-field resize-none w-full" />

                <Button type="submit" variant="primary" size="lg" fullWidth loading={isLoading}>
                  Save Changes
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>

      <Modal open={showProfilePrompt} onClose={() => setShowProfilePrompt(false)} title="Complete Your Profile">
        <div className="space-y-4">
          <p className="text-sm">Please complete your profile first.</p>
          <Button variant="primary" fullWidth onClick={() => setShowProfilePrompt(false)}>
            Complete Profile
          </Button>
        </div>
      </Modal>
    </PageWrapper>
  );
}
