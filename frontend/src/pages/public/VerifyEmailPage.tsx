import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Sparkles, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const { verifyEmail, resendOtp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await verifyEmail(email, otp.trim());
      if (res?.success) {
        setSuccessMsg('Your email has been verified! Welcoming you into the sanctuary...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Invalid or expired verification code.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setError('');
    setSuccessMsg('');

    try {
      await resendOtp(email);
      setSuccessMsg('A new 6-digit code has been sent to your email.');
      setResendCooldown(60);
      setCanResend(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend code. Please wait.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0819] flex flex-col justify-center py-12 sm:px-6 lg:px-8 mystic-gradient-bg">
      {/* Back Button */}
      <div className="absolute top-6 left-6">
        <button
          onClick={() => navigate('/signup')}
          className="group flex items-center gap-2 text-sm text-slate-400 hover:text-amber-300 transition-all duration-200"
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-full border border-purple-800/60 bg-purple-950/40 group-hover:border-amber-400/60 group-hover:bg-purple-900/40 transition-all duration-200">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
          </span>
          <span className="font-medium">Back to Signup</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-2">
          <div className="w-12 h-12 rounded-xl bg-purple-900/60 border border-purple-500/40 flex items-center justify-center shadow-glow-purple">
            <Sparkles className="w-6 h-6 text-amber-400" />
          </div>
        </Link>
        <h2 className="mt-4 text-3xl font-serif font-bold text-slate-100 tracking-wide">
          Verify Your Key
        </h2>
        <p className="mt-2 text-xs text-purple-300 font-mono tracking-wider uppercase">
          Enter The 6-Digit Code Sent To
        </p>
        <p className="text-amber-300 font-medium text-sm mt-0.5">{email || 'your email'}</p>
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

          <form onSubmit={handleVerify} className="space-y-6">
            {!emailParam && (
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-purple-200 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#120c29] border border-purple-800/60 rounded-lg text-sm text-slate-100 outline-none"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-purple-200 mb-2 text-center">
                Sacred 6-Digit OTP
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="••••••"
                className="w-full text-center text-3xl font-mono tracking-[0.5em] py-3 bg-[#0d0921] border border-purple-700/60 hover:border-amber-400 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl text-amber-300 placeholder-slate-600 outline-none transition-colors"
                autoFocus
                required
              />
            </div>

            <Button
              type="submit"
              variant="gold"
              className="w-full py-3"
              isLoading={loading}
            >
              Verify &amp; Enter Sanctuary
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-purple-900/50 flex items-center justify-between text-xs">
            <span className="text-slate-400">Did not receive the code?</span>
            <button
              onClick={handleResend}
              disabled={!canResend}
              className={`flex items-center gap-1 font-medium transition-colors ${
                canResend
                  ? 'text-amber-400 hover:text-amber-300 cursor-pointer'
                  : 'text-slate-500 cursor-not-allowed'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${!canResend ? 'animate-spin' : ''}`} />
              <span>{canResend ? 'Resend Code' : `Wait ${resendCooldown}s`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
