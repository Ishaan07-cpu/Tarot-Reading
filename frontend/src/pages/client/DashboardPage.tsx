import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Booking } from '../../types';
import { ClientLayout } from '../../components/layout/ClientLayout';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Sparkles,
  Calendar,
  Clock,
  Compass,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Ban,
  RefreshCw,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { subscribeToUpdates } = useSocket();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Cancellation modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const fetchBookings = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await api.get('/bookings/my-bookings');
      if (res.data?.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load my bookings', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();

    // 1. Subscribe to real-time signal: refetch authoritative data when an update arrives
    const unsubscribe = subscribeToUpdates(() => {
      fetchBookings(true);
    });

    // 2. Fallback: Refetch when window regains focus
    const handleFocus = () => {
      fetchBookings(true);
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      unsubscribe();
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchBookings, subscribeToUpdates]);

  const handleOpenCancel = (booking: Booking) => {
    setSelectedBooking(booking);
    setCancelReason('');
    setCancelError('');
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;
    setCancelLoading(true);
    setCancelError('');

    try {
      const res = await api.patch(`/bookings/${selectedBooking._id}/cancel`, {
        reason: cancelReason.trim(),
      });
      if (res.data?.success) {
        setCancelModalOpen(false);
        fetchBookings(true);
      }
    } catch (err: any) {
      setCancelError(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancelLoading(false);
    }
  };

  // Derived stats
  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;
  const approvedCount = bookings.filter((b) => b.status === 'APPROVED').length;
  const completedCount = bookings.filter((b) => b.status === 'COMPLETED').length;

  // Next upcoming approved booking
  const upcomingBooking = bookings.find(
    (b) => b.status === 'APPROVED' && b.slotId?.date >= new Date().toISOString().split('T')[0]
  );

  return (
    <ClientLayout>
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 border-b border-purple-900/40 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-amber-400 mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Seeker Sanctuary</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100">
            Welcome, <span className="gold-shimmer">{user?.name}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Your sacred space for booking, status tracking, and card wisdom.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchBookings(true)}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-purple-300 hover:text-amber-300 hover:border-purple-600 transition-colors"
            title="Refresh status"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <Link to="/book">
            <Button variant="gold" size="md" className="shadow-glow">
              <span>Book New Reading</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-20">
          <LoadingSpinner message="Gathering your session records..." />
        </div>
      ) : (
        <div className="space-y-8 mt-8">
          {/* Upcoming Session Banner if any */}
          {upcomingBooking && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/90 via-indigo-950/90 to-purple-900/60 border border-amber-500/50 shadow-glow flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono uppercase tracking-wider text-amber-300">
                      Next Confirmed Reading
                    </span>
                    <Badge status="APPROVED" size="sm" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-slate-100">
                    {upcomingBooking.readingTypeId?.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-2">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      {upcomingBooking.slotId?.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-purple-400" />
                      {upcomingBooking.slotId?.startTime} - {upcomingBooking.slotId?.endTime}
                    </span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenCancel(upcomingBooking)}
                  className="text-red-300 hover:text-red-200 border-red-800/60 hover:bg-red-950/40"
                >
                  Cancel Booking
                </Button>
              </div>
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-[#140e30]/80 border border-purple-900/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Pending Approval
                </span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-serif font-bold text-amber-300 mt-2">
                {pendingCount}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Awaiting reader confirmation</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#140e30]/80 border border-purple-900/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Approved & Upcoming
                </span>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-serif font-bold text-emerald-300 mt-2">
                {approvedCount}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Confirmed sacred slots</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#140e30]/80 border border-purple-900/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Completed Sessions
                </span>
                <Compass className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-3xl font-serif font-bold text-purple-300 mt-2">
                {completedCount}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Wisdom readings held</p>
            </div>
          </div>

          {/* Bookings Table / List */}
          <div className="rounded-2xl bg-[#140e30]/90 border border-purple-900/40 overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-purple-900/40 flex items-center justify-between bg-[#110b27]">
              <div>
                <h3 className="font-serif font-bold text-lg text-slate-100">
                  Your Reading Requests
                </h3>
                <p className="text-xs text-slate-400">Authoritative status synchronized in real time</p>
              </div>
              <Link
                to="/bookings"
                className="text-xs text-amber-400 hover:text-amber-300 font-medium"
              >
                View full history &rarr;
              </Link>
            </div>

            {bookings.length === 0 ? (
              <div className="p-12 text-center">
                <Compass className="w-10 h-10 text-purple-500/50 mx-auto mb-3" />
                <h4 className="text-base font-serif font-semibold text-slate-200">
                  No readings scheduled yet
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-6">
                  The cards are waiting to reveal their wisdom. Reserve your first session today.
                </p>
                <Link to="/book">
                  <Button variant="gold" size="sm">
                    Book a Sacred Reading
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-[#0e0921] text-[11px] font-mono uppercase tracking-wider text-purple-300 border-b border-purple-900/30">
                    <tr>
                      <th className="px-6 py-3.5">Reading Type</th>
                      <th className="px-6 py-3.5">Date & Slot</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Investment</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-950/60 font-sans">
                    {bookings.slice(0, 5).map((b) => (
                      <tr key={b._id} className="hover:bg-purple-950/20 transition-colors">
                        <td className="px-6 py-4 font-serif font-medium text-slate-100">
                          {b.readingTypeId?.name || 'Tarot Reading'}
                          {b.notes && (
                            <p className="text-xs text-slate-400 font-sans truncate max-w-xs mt-0.5">
                              Note: {b.notes}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs font-medium text-slate-200">
                            {b.slotId?.date}
                          </div>
                          <div className="text-xs text-slate-400">
                            {b.slotId?.startTime} - {b.slotId?.endTime}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge status={b.status} />
                          {b.rejectionReason && (
                            <p className="text-[11px] text-red-400 mt-1">
                              Reason: {b.rejectionReason}
                            </p>
                          )}
                          {b.cancellationReason && (
                            <p className="text-[11px] text-zinc-400 mt-1">
                              Reason: {b.cancellationReason}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 font-serif font-bold text-amber-300">
                          ₹{b.readingTypeId?.price || 0}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {(b.status === 'PENDING' || b.status === 'APPROVED') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300"
                              onClick={() => handleOpenCancel(b)}
                            >
                              Cancel
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Reading Request"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Are you sure you wish to cancel your scheduled session for{' '}
            <span className="text-amber-300 font-serif font-semibold">
              {selectedBooking?.readingTypeId?.name}
            </span>{' '}
            on {selectedBooking?.slotId?.date} at {selectedBooking?.slotId?.startTime}?
          </p>

          <p className="text-xs text-slate-400">
            This will release the reserved slot so another seeker may book it.
          </p>

          {cancelError && (
            <div className="p-3 rounded-lg bg-red-950/70 border border-red-700/50 text-xs text-red-200">
              {cancelError}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-purple-200 mb-1">
              Reason for cancellation (optional)
            </label>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Schedule conflict..."
              className="w-full px-3 py-2 bg-[#120c29] border border-purple-800/60 rounded-lg text-xs text-slate-100 outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelModalOpen(false)}
              disabled={cancelLoading}
            >
              Keep Booking
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmCancel}
              isLoading={cancelLoading}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </ClientLayout>
  );
};
