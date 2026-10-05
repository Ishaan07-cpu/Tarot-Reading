import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Sparkles, Lock, Mail, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res?.success) {
        const user = res.data.user;
        if (redirect) {
          navigate(redirect);
        } else if (user.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      const data = err.response?.data?.errors;

      if (data?.needsVerification) {
        navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
        return;
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0819] flex flex-col justify-center py-12 sm:px-6 lg:px-8 mystic-gradient-bg">
      {/* Back Button */}
      <div className="absolute top-6 left-6">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-sm text-slate-400 hover:text-amber-300 transition-all duration-200"
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-full border border-purple-800/60 bg-purple-950/40 group-hover:border-amber-400/60 group-hover:bg-purple-900/40 transition-all duration-200">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
          </span>
          <span className="font-medium">Back</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-2 group">
          <div className="w-12 h-12 rounded-xl bg-purple-900/60 border border-purple-500/40 flex items-center justify-center shadow-glow-purple group-hover:border-amber-400 transition-colors">
            <Sparkles className="w-6 h-6 text-amber-400" />
          </div>
        </Link>
        <h2 className="mt-4 text-3xl font-serif font-bold text-slate-100 tracking-wide">
          Enter The Sanctuary
        </h2>
        <p className="mt-2 text-xs text-purple-300 font-mono tracking-wider uppercase">
          Sign In To Access Your Readings
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="seeker@mystictarot.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium uppercase tracking-wider text-purple-200">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-[#120c29]/90 border border-purple-800/60 hover:border-purple-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-lg text-sm text-slate-100 placeholder-slate-500 transition-colors outline-none"
              />
            </div>

            <Button
              type="submit"
              variant="gold"
              className="w-full py-3"
              isLoading={loading}
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-purple-900/50 text-center">
            <p className="text-xs text-slate-400">
              New seeker?{' '}
              <Link
                to="/signup"
                className="text-amber-400 hover:text-amber-300 font-semibold ml-1"
              >
                Create your sacred account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
