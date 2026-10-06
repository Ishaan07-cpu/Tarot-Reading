import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Sparkles, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    };

    if (cleanData.password !== cleanData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (cleanData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (cleanData.phone.length < 7) {
      setError('Phone number must be at least 7 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await signup(cleanData);
      if (res?.success) {
        navigate(`/verify-email?email=${encodeURIComponent(cleanData.email)}`);
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        (err.message === 'Network Error'
          ? 'Unable to reach the server. Please check your connection or server status.'
          : 'Failed to create account. Please try again.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0b0819] flex flex-col justify-center py-12 sm:px-6 lg:px-8 mystic-gradient-bg">
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          to="/login"
          className="group flex items-center gap-2 text-sm text-slate-400 hover:text-amber-300 transition-all duration-200"
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-full border border-purple-800/60 bg-purple-950/60 group-hover:border-amber-400/60 group-hover:bg-purple-900/60 transition-all duration-200 shadow-md">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
          </span>
          <span className="font-medium">Back to Sign In</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-2">
          <div className="w-12 h-12 rounded-xl bg-purple-900/60 border border-purple-500/40 flex items-center justify-center shadow-glow-purple">
            <Sparkles className="w-6 h-6 text-amber-400" />
          </div>
        </Link>
        <h2 className="mt-4 text-3xl font-serif font-bold text-slate-100 tracking-wide">
          Begin Your Journey
        </h2>
        <p className="mt-2 text-xs text-purple-300 font-mono tracking-wider uppercase">
          Create Your Mystic Tarot Account
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              placeholder="Elena Vance"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="elena@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              label="Phone Number"
              name="phone"
              placeholder="+1-555-0199"
              value={formData.phone}
              onChange={handleChange}
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Repeat your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            <Button
              type="submit"
              variant="gold"
              className="w-full py-3 mt-2"
              isLoading={loading}
            >
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-purple-900/50 text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-amber-400 hover:text-amber-300 font-semibold ml-1"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
