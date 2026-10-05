import React from 'react';
import { useSocket } from '../../context/SocketContext';
import { Bell, CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { notifications, dismissNotification } = useSocket();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none">
      {notifications.map((notif) => {
        let icon = <Bell className="w-5 h-5 text-purple-400" />;
        let borderClass = 'border-purple-600/50 bg-[#171038]/95';

        if (notif.type === 'success') {
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
          borderClass = 'border-emerald-600/50 bg-[#0d231a]/95';
        } else if (notif.type === 'error') {
          icon = <XCircle className="w-5 h-5 text-red-400" />;
          borderClass = 'border-red-600/50 bg-[#2b0f16]/95';
        } else if (notif.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-400" />;
          borderClass = 'border-amber-600/50 bg-[#2b1f0d]/95';
        }

        return (
          <div
            key={notif.id}
            className={`pointer-events-auto p-4 rounded-xl border ${borderClass} shadow-xl shadow-black/50 backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 duration-300 flex items-start gap-3`}
          >
            <div className="shrink-0 mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-serif">
                {notif.title}
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {notif.message}
              </p>
            </div>
            <button
              onClick={() => dismissNotification(notif.id)}
              className="shrink-0 text-slate-400 hover:text-slate-200 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
