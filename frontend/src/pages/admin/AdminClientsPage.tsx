import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../services/api';
import { User, Booking } from '../../types';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Users, Search, Eye, ShieldCheck, ShieldAlert, Phone, Mail, Calendar } from 'lucide-react';

export const AdminClientsPage: React.FC = () => {
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Selected client detail modal
  const [selectedClientData, setSelectedClientData] = useState<{
    user: User;
    bookings: Booking[];
  } | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchClients = useCallback(async () => {
    try {
      const res = await api.get('/admin/users', { params: { search } });
      if (res.data?.success) {
        setClients(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load clients', err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const openClientDetails = async (clientId: string) => {
    setDetailsLoading(true);
    try {
      const res = await api.get(`/admin/users/${clientId}`);
      if (res.data?.success) {
        setSelectedClientData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-purple-900/40">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100">
              Client & Seeker Directory
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Registered seekers, verification status, and historical consultation volume
            </p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#140e30] border border-purple-800/60 rounded-xl text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-24">
            <LoadingSpinner message="Querying seeker directory..." />
          </div>
        ) : clients.length === 0 ? (
          <div className="p-16 text-center rounded-2xl bg-[#140e30]/80 border border-purple-900/40">
            <Users className="w-10 h-10 text-purple-500/50 mx-auto mb-3" />
            <h3 className="text-base font-serif font-semibold text-slate-200">
              No clients found
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Try modifying your search query.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-[#140e30]/90 border border-purple-900/40 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-[#0e0921] text-[11px] font-mono uppercase tracking-wider text-purple-300 border-b border-purple-900/30">
                  <tr>
                    <th className="px-6 py-4">Client Name</th>
                    <th className="px-6 py-4">Contact Details</th>
                    <th className="px-6 py-4">Verification</th>
                    <th className="px-6 py-4">Total Bookings</th>
                    <th className="px-6 py-4">Joined Date</th>
                    <th className="px-6 py-4 text-right">Consultations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-950/60 font-sans">
                  {clients.map((c) => (
                    <tr key={c.id} className="hover:bg-purple-950/20 transition-colors">
                      <td className="px-6 py-4 font-serif font-semibold text-slate-100">
                        {c.name}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-200 font-mono">{c.email}</div>
                        <div className="text-xs text-slate-400 font-mono">{c.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        {c.isEmailVerified ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-mono">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>VERIFIED</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-mono">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>UNVERIFIED</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-amber-300">
                        {c.totalBookings || 0} sessions
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400 font-mono">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openClientDetails(c.id)}
                          className="text-purple-300 hover:text-white"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          <span>History</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Client Details & History Modal */}
        <Modal
          isOpen={!!selectedClientData}
          onClose={() => setSelectedClientData(null)}
          title="Seeker Profile & Booking History"
          maxWidth="lg"
        >
          {selectedClientData && (
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="p-4 rounded-xl bg-[#100a26] border border-purple-800/40 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Name</span>
                  <span className="text-slate-100 font-serif font-bold text-sm">
                    {selectedClientData.user.name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Email</span>
                  <span className="text-slate-200 font-mono">
                    {selectedClientData.user.email}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Phone</span>
                  <span className="text-slate-200 font-mono">
                    {selectedClientData.user.phone || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Joined Sanctuary</span>
                  <span className="text-slate-200 font-mono">
                    {selectedClientData.user.createdAt
                      ? new Date(selectedClientData.user.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Consultation History */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-purple-300 mb-3">
                  All Client Sessions ({selectedClientData.bookings.length})
                </h4>

                {selectedClientData.bookings.length === 0 ? (
                  <p className="text-xs text-slate-400">No booking requests submitted yet.</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedClientData.bookings.map((b) => (
                      <div
                        key={b._id}
                        className="p-3.5 rounded-xl bg-[#0d0821] border border-purple-950 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-serif font-semibold text-slate-100">
                            {b.readingTypeId?.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {b.slotId?.date} at {b.slotId?.startTime} - {b.slotId?.endTime}
                          </div>
                        </div>
                        <Badge status={b.status} size="sm" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
};
