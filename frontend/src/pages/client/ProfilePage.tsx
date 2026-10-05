import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ClientLayout } from '../../components/layout/ClientLayout';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Sparkles, CheckCircle2, ShieldCheck, User as UserIcon, Phone, Mail } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await updateProfile({ name: name.trim(), phone: phone.trim() });
      setSuccessMsg('Profile updated successfully.');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClientLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100">
            Seeker Profile & Sacred Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your personal details and account credentials
          </p>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-700/50 flex items-center gap-3 text-xs text-emerald-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-950/70 border border-red-700/50 text-xs text-red-200">
            {errorMsg}
          </div>
        )}

        <div className="p-8 rounded-2xl bg-[#140e30]/90 border border-purple-800/40 shadow-xl">
          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-purple-200 mb-1.5">
                Email Address (Verified & Protected)
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3.5 py-2.5 bg-[#0d0921] border border-purple-900/60 rounded-lg text-sm text-slate-400 cursor-not-allowed outline-none"
                />
                <div className="absolute right-3 top-2.5 flex items-center gap-1 text-xs text-emerald-400 font-mono">
                  <ShieldCheck className="w-4 h-4" />
                  <span>VERIFIED</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Your email is locked to ensure session booking integrity.
              </p>
            </div>

            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
            />

            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Your phone number"
              required
            />

            <div className="pt-4 border-t border-purple-900/40 flex justify-end">
              <Button type="submit" variant="gold" isLoading={loading}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ClientLayout>
  );
};
