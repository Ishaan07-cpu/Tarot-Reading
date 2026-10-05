import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { Booking, BookingStatus } from '../../types';
import { ClientLayout } from '../../components/layout/ClientLayout';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Calendar,
  Clock,
  Filter,
  Eye,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';

export const BookingsHistoryPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const { subscribeToUpdates } = useSocket();

  const fetchBookings = useCallback(async () => {
    try {
      const res = await api.get('/bookings/my-bookings');
      if (res.data?.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load booking history', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
    const unsub = subscribeToUpdates(() => {
      fetchBookings();
    });
    return () => unsub();
  }, [fetchBookings, subscribeToUpdates]);

  const filteredBookings =
    statusFilter === 'ALL'
      ? bookings
      : bookings.filter((b) => b.status === statusFilter);

  return (
    <ClientLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-purple-900/40 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100">
              Booking History & Archives
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Review all past, upcoming, and processed consultation requests
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-[#140e30] border border-purple-800/60 text-xs font-mono uppercase tracking-wider text-slate-200 outline-none focus:border-amber-400"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <button
              onClick={fetchBookings}
              className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-purple-300 hover:text-amber-300"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-24">
            <LoadingSpinner message="Opening your sacred consultation archives..." />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-16 text-center rounded-2xl bg-[#140e30]/80 border border-purple-900/40">
            <Calendar className="w-10 h-10 text-purple-500/50 mx-auto mb-3" />
            <h3 className="text-base font-serif font-semibold text-slate-200">
              No bookings matching filter
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Try selecting a different filter or schedule a new consultation.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-[#140e30]/90 border border-purple-900/40 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-[#0e0921] text-[11px] font-mono uppercase tracking-wider text-purple-300 border-b border-purple-900/30">
                  <tr>
                    <th className="px-6 py-4">Booking ID</th>
                    <th className="px-6 py-4">Reading Type</th>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Investment</th>
                    <th className="px-6 py-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-950/60">
                  {filteredBookings.map((b) => (
                    <tr
                      key={b._id}
                      className="hover:bg-purple-950/20 transition-colors cursor-pointer"
                      onClick={() => setSelectedBooking(b)}
                    >
                      <td className="px-6 py-4 font-mono text-xs text-amber-400/90">
                        #{b._id.substring(b._id.length - 8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 font-serif font-medium text-slate-100">
                        {b.readingTypeId?.name}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-200">{b.slotId?.date}</div>
                        <div className="text-xs text-slate-400">
                          {b.slotId?.startTime} - {b.slotId?.endTime}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge status={b.status} />
                      </td>
                      <td className="px-6 py-4 font-serif font-bold text-amber-300">
                        ₹{b.readingTypeId?.price || 0}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 text-purple-300" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detailed Booking Modal */}
        <Modal
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          title="Booking Details"
          maxWidth="lg"
        >
          {selectedBooking && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                    Booking ID
                  </span>
                  <span className="font-mono text-xs text-amber-300">
                    {selectedBooking._id}
                  </span>
                </div>
                <Badge status={selectedBooking.status} />
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-[#100a26] border border-purple-900/30">
                  <span className="text-slate-400 block mb-1">Reading Spread</span>
                  <span className="font-serif font-bold text-slate-100 text-sm">
                    {selectedBooking.readingTypeId?.name}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#100a26] border border-purple-900/30">
                  <span className="text-slate-400 block mb-1">Duration & Price</span>
                  <span className="font-serif font-bold text-amber-300 text-sm">
                    {selectedBooking.readingTypeId?.duration} mins • ₹{selectedBooking.readingTypeId?.price}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#100a26] border border-purple-900/30">
                  <span className="text-slate-400 block mb-1">Scheduled Date</span>
                  <span className="font-mono text-slate-200">
                    {selectedBooking.slotId?.date}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#100a26] border border-purple-900/30">
                  <span className="text-slate-400 block mb-1">Scheduled Time</span>
                  <span className="font-mono text-slate-200">
                    {selectedBooking.slotId?.startTime} - {selectedBooking.slotId?.endTime}
                  </span>
                </div>
              </div>

              {selectedBooking.notes && (
                <div className="p-3.5 rounded-xl bg-[#100a26] border border-purple-900/30">
                  <span className="text-xs text-slate-400 block mb-1">Your Consultation Notes</span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {selectedBooking.notes}
                  </p>
                </div>
              )}

              {selectedBooking.rejectionReason && (
                <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/50">
                  <span className="text-xs text-red-300 font-semibold block mb-1">
                    Reader Rejection Note
                  </span>
                  <p className="text-xs text-red-200 leading-relaxed">
                    {selectedBooking.rejectionReason}
                  </p>
                </div>
              )}

              {selectedBooking.cancellationReason && (
                <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-700/50">
                  <span className="text-xs text-zinc-400 font-semibold block mb-1">
                    Cancellation Reason
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {selectedBooking.cancellationReason}
                  </p>
                </div>
              )}

              <div className="text-[11px] text-slate-400 pt-2 border-t border-purple-900/40 flex justify-between">
                <span>Requested: {new Date(selectedBooking.createdAt).toLocaleString()}</span>
                {selectedBooking.approvedAt && (
                  <span className="text-emerald-400">
                    Approved: {new Date(selectedBooking.approvedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </ClientLayout>
  );
};
