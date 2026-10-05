import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Menu, X, User, LogOut, Compass, Shield } from 'lucide-react';
import { Button } from '../common/Button';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Add shadow + background opacity on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleBookClick = () => {
    if (isAuthenticated) {
      navigate('/book');
    } else {
      navigate('/login?redirect=/book');
    }
  };

  const navLinks = [
    { label: 'Readings', href: '/#readings' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Sacred Benefits', href: '/#benefits' },
    { label: 'FAQ', href: '/#faq' },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b border-purple-900/40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0b0819]/95 backdrop-blur-lg shadow-lg shadow-purple-950/30'
          : 'bg-[#0b0819]/80 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-900 via-indigo-950 to-amber-500/20 border border-purple-500/40 flex items-center justify-center shadow-glow-purple group-hover:border-amber-400/80 transition-all duration-300">
              <Sparkles className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <div>
              <span className="font-serif text-xl font-bold tracking-wider gold-shimmer block leading-none">
                MYSTIC TAROT
              </span>
              <span className="text-[10px] text-purple-300/80 uppercase tracking-widest font-sans">
                Sacred Guidance
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative px-3 py-2 text-sm font-medium text-slate-300 hover:text-amber-300 transition-colors duration-200 group"
              >
                {link.label}
                {/* Animated underline */}
                <span className="absolute bottom-0 left-3 right-3 h-px bg-amber-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-250 origin-left rounded-full" />
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                {user?.role === 'ADMIN' ? (
                  <Link to="/admin/dashboard" className="group">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-1.5 transition-all duration-200 group-hover:scale-[1.03] group-hover:shadow-md"
                    >
                      <Shield className="w-4 h-4 text-amber-400" />
                      <span>Admin Portal</span>
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/dashboard" className="group">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-1.5 transition-all duration-200 group-hover:scale-[1.03]"
                      >
                        <Compass className="w-4 h-4 text-purple-400" />
                        <span>Dashboard</span>
                      </Button>
                    </Link>
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={handleBookClick}
                      className="shadow-glow transition-all duration-200 hover:scale-[1.04] hover:shadow-amber-500/30"
                    >
                      Book Reading
                    </Button>
                  </>
                )}
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-purple-950/40 transition-all duration-200 hover:scale-110"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="relative text-sm font-medium text-slate-200 hover:text-amber-300 px-3 py-2 transition-colors duration-200 group"
                >
                  Sign In
                  <span className="absolute bottom-0 left-3 right-3 h-px bg-amber-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-250 origin-left rounded-full" />
                </Link>
                <Button
                  variant="gold"
                  size="sm"
                  onClick={handleBookClick}
                  className="transition-all duration-200 hover:scale-[1.04] hover:shadow-amber-500/30"
                >
                  Book a Reading
                </Button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-purple-950/50 transition-all duration-200"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <span
                className={`block transition-all duration-300 ${
                  mobileMenuOpen ? 'rotate-90 opacity-100' : 'rotate-0 opacity-100'
                }`}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer — animated slide-down */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-b border-purple-900/60 bg-[#0d091e] px-4 pt-3 pb-6 space-y-1">
          {navLinks.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              style={{ transitionDelay: mobileMenuOpen ? `${i * 40}ms` : '0ms' }}
              className={`flex items-center px-3 py-2.5 text-base font-medium text-slate-200 hover:text-amber-300 hover:bg-purple-900/30 rounded-lg transition-all duration-200 ${
                mobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'
              }`}
            >
              {link.label}
            </a>
          ))}

          <div className="pt-4 border-t border-purple-900/40 space-y-2">
            {isAuthenticated ? (
              <>
                {user?.role === 'ADMIN' ? (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-purple-900 text-amber-200 font-medium hover:bg-purple-800 transition-colors duration-200"
                  >
                    <Shield className="w-4 h-4 text-amber-400" />
                    Admin Portal
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-purple-950 text-purple-200 border border-purple-700/40 font-medium hover:bg-purple-900/60 transition-colors duration-200"
                    >
                      <Compass className="w-4 h-4 text-purple-400" />
                      Dashboard
                    </Link>
                    <Button
                      variant="gold"
                      className="w-full"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleBookClick();
                      }}
                    >
                      Book Reading
                    </Button>
                  </>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-center py-2 text-sm text-red-400 hover:text-red-300 transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-2 text-slate-300 hover:text-amber-300 transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Button
                  variant="gold"
                  className="w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleBookClick();
                  }}
                >
                  Book a Reading
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
