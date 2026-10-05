import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Mail, Shield, Server, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { isConnected } = useSocket();
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmailLogs = async () => {
    try {
      const res = await api.get('/admin/email-logs');
      if (res.data?.success) {
        setEmailLogs(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmailLogs();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-purple-900/40">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100">
              System Health & Delivery Logs
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Outbox notifications, email delivery tracking, and environment status
            </p>
          </div>

          <button
            onClick={fetchEmailLogs}
            className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-purple-300 hover:text-amber-300"
            title="Refresh logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* System Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#140e30]/90 border border-purple-900/40">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase text-slate-400">Database & Storage</span>
              <Server className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-lg font-serif font-bold text-emerald-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>MongoDB Atlas Connected</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Transactions & Outbox active</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#140e30]/90 border border-purple-900/40">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase text-slate-400">Realtime Engine</span>
              <Server className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-lg font-serif font-bold text-slate-100 flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'
                }`}
              />
              <span className={isConnected ? 'text-emerald-300' : 'text-zinc-400'}>
                {isConnected ? 'Socket.IO Online' : 'Connecting...'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Instant signaling active</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#140e30]/90 border border-purple-900/40">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase text-slate-400">Logged Administrator</span>
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-lg font-serif font-bold text-amber-300">{user?.name}</div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">{user?.email}</p>
          </div>
        </div>

        {/* Email Logs Table */}
        <div className="rounded-2xl bg-[#140e30]/90 border border-purple-900/40 overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-purple-900/40 bg-[#100a26] flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-lg text-slate-100">
                Email Notification Logs
              </h3>
              <p className="text-xs text-slate-400">
                De-coupled outbox dispatch records (Nodemailer / Gmail SMTP)
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-16">
              <LoadingSpinner message="Loading delivery logs..." />
            </div>
          ) : emailLogs.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No email events logged yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-[#0e0921] text-[11px] font-mono uppercase tracking-wider text-purple-300 border-b border-purple-900/30">
                  <tr>
                    <th className="px-6 py-3.5">Event Type</th>
                    <th className="px-6 py-3.5">Recipient</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Attempts</th>
                    <th className="px-6 py-3.5 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-950/60 font-mono text-xs">
                  {emailLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-purple-950/20 transition-colors">
                      <td className="px-6 py-3.5 text-amber-300 font-semibold">
                        {log.type}
                      </td>
                      <td className="px-6 py-3.5 text-slate-300">
                        {log.recipient}
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            log.status === 'SENT'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/40'
                              : log.status === 'PENDING'
                              ? 'bg-amber-950 text-amber-300 border border-amber-600/40'
                              : 'bg-red-950 text-red-300 border border-red-600/40'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-400">
                        {log.attempts}
                      </td>
                      <td className="px-6 py-3.5 text-right text-slate-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
