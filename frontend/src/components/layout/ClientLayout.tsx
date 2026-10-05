import React from 'react';
import { Navbar } from './Navbar';
import { Sparkles, Moon, Heart } from 'lucide-react';

export const ClientLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#0b0819] flex flex-col mystic-gradient-bg">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="border-t border-purple-900/30 bg-[#070512] py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-purple-400">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="font-serif tracking-wider text-slate-300">MYSTIC TAROT SANCTUARY</span>
          </div>
          <p>© {new Date().getFullYear()} Mystic Tarot. Sacred guidance for aligned journeys.</p>
        </div>
      </footer>
    </div>
  );
};
