import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Sparkles, ArrowRight, CheckCircle2, AlertCircle, KeyRound, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email: cleanEmail });
      if (res.data?.success) {
        setSuccessMsg(res.data.message || 'Reset code sent to your email.');
        setStep('reset');
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        (err.message === 'Network Error'
          ? 'Unable to reach the server. Please check your connection.'
          : 'Failed to send reset code.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please provide your email address.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (otp.trim().length !== 6) {
      setError('Please enter the complete 6-digit reset code.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/reset-password', {
        email: cleanEmail,
        otp: otp.trim(),
        password,
        confirmPassword,
      });

      if (res.data?.success) {
        setSuccessMsg('Your password has been successfully updated! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 1800);
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        (err.message === 'Network Error'
          ? 'Unable to reach the server. Please check your connection.'
          : 'Invalid or expired reset code.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0b0819] flex flex-col justify-center py-12 sm:px-6 lg:px-8 mystic-gradient-bg">
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-20">
        {step === 'reset' ? (
          <button
            type="button"
            onClick={() => { setStep('request'); setError(''); setSuccessMsg(''); }}
            className="group flex items-center gap-2 text-sm text-slate-400 hover:text-amber-300 transition-all duration-200 cursor-pointer"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-full border border-purple-800/60 bg-purple-950/60 group-hover:border-amber-400/60 group-hover:bg-purple-900/60 transition-all duration-200 shadow-md">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
            </span>
            <span className="font-medium">Back to Email</span>
          </button>
        ) : (
          <Link
            to="/login"
            className="group flex items-center gap-2 text-sm text-slate-400 hover:text-amber-300 transition-all duration-200"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-full border border-purple-800/60 bg-purple-950/60 group-hover:border-amber-400/60 group-hover:bg-purple-900/60 transition-all duration-200 shadow-md">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
            </span>
            <span className="font-medium">Back to Sign In</span>
          </Link>
        )}
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-2 group">
          <div className="w-12 h-12 rounded-xl bg-purple-900/60 border border-purple-500/40 flex items-center justify-center shadow-glow-purple group-hover:border-amber-400 transition-colors">
            <Sparkles className="w-6 h-6 text-amber-400" />
          </div>
        </Link>
        <h2 className="mt-4 text-3xl font-serif font-bold text-slate-100 tracking-wide">
          Reset Your Key
        </h2>
        <p className="mt-2 text-xs text-purple-300 font-mono tracking-wider uppercase">
          {step === 'request' ? 'Request Password Reset' : 'Enter Reset Code & New Password'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-[#140e30]/90 border border-purple-800/50 py-8 px-6 sm:px-10 rounded-2xl shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/70 border border-red-700/50 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-200">{error}</p>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/70 border border-emerald-700/50 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-200">{successMsg}</p>
            </div>
          )}

          {step === 'request' ? (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <Input
                label="Registered Email Address"
                type="email"
                placeholder="seeker@mystictarot.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="gold"
                className="w-full py-3"
                isLoading={loading}
              >
                <span>Send Reset Code</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* Back to request helper */}
              <div className="flex items-center justify-between text-xs pb-1 border-b border-purple-900/40">
                <button
                  type="button"
                  onClick={() => { setStep('request'); setError(''); setSuccessMsg(''); }}
                  className="inline-flex items-center gap-1 text-purple-300 hover:text-amber-300 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change email ({email})</span>
                </button>
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={loading}
                  className="text-amber-400 hover:text-amber-300 transition-colors cursor-pointer font-medium"
                >
                  Resend Code
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-purple-200 mb-1">
                  6-Digit Reset Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  className="w-full text-center text-2xl font-mono tracking-widest py-2.5 bg-[#0d0921] border border-purple-700/60 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-lg text-amber-300 outline-none transition-all"
                  required
                />
              </div>

              <Input
                label="New Password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="gold"
                className="w-full py-3 mt-2"
                isLoading={loading}
              >
                <span>Update Password</span>
                <KeyRound className="w-4 h-4 ml-2" />
              </Button>
            </form>
          )}

          {/* Bottom Card Footer with Back to Sign In Link */}
          <div className="mt-6 pt-6 border-t border-purple-900/50 text-center">
            <p className="text-xs text-slate-400">
              Remember your password?{' '}
              <Link
                to="/login"
                className="text-amber-400 hover:text-amber-300 font-semibold ml-1 inline-flex items-center gap-1 transition-colors"
              >
                <span>Back to Sign In</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
