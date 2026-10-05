import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import {
  LayoutDashboard,
  CalendarDays,
  Clock,
  Users,
  BookOpen,
  LogOut,
  Sparkles,
  Menu,
  X,
  Wifi,
  WifiOff,
  Sliders,
  ChevronRight,
} from 'lucide-react';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Bookings', path: '/admin/bookings', icon: CalendarDays },
    { label: 'Slots & Calendar', path: '/admin/slots', icon: Clock },
    { label: 'Reading Catalog', path: '/admin/reading-types', icon: BookOpen },
    { label: 'Clients', path: '/admin/clients', icon: Users },
    { label: 'System & Logs', path: '/admin/settings', icon: Sliders },
  ];

  return (
    <div className="min-h-screen bg-[#090714] text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#100b24] border-b border-purple-900/40">
        <Link to="/admin/dashboard" className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="font-serif font-bold text-amber-200 tracking-wider">
            ADMIN SANCTUARY
          </span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-300 hover:text-white"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0e0921] border-r border-purple-900/40 flex flex-col transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="p-6 border-b border-purple-900/40">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-purple-900/50 border border-purple-500/40 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold gold-shimmer tracking-wider">
                MYSTIC TAROT
              </h2>
              <span className="text-[10px] text-amber-400/80 font-mono tracking-wider uppercase">
                ADMIN CONSOLE
              </span>
            </div>
          </Link>
        </div>

        {/* Realtime Status Indicator */}
        <div className="px-6 py-3 bg-[#0a0717] border-b border-purple-950/80 flex items-center justify-between text-xs">
          <span className="text-slate-400">Live Realtime:</span>
          <span
            className={`inline-flex items-center gap-1.5 font-mono ${
              isConnected ? 'text-emerald-400' : 'text-zinc-500'
            }`}
          >
            {isConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>ONLINE</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-zinc-600" />
                <span>OFFLINE</span>
              </>
            )}
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-purple-900/60 text-amber-300 border border-purple-600/40 shadow-glow-purple'
                    : 'text-slate-300 hover:text-white hover:bg-purple-950/40'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-amber-400' : 'text-purple-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-amber-400" />}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-purple-900/40 bg-[#0a0717]">
          <div className="flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-medium text-slate-200 truncate">{user?.name}</p>
              <p className="text-[11px] text-amber-400/90 truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-purple-950/60 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile drawer */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden min-h-screen flex flex-col">
        <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</div>
      </main>
    </div>
  );
};
