import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { DashboardStats, Booking } from '../../types';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  Users,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Check,
  X,
  RefreshCw,
  LayoutGrid,
  List,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Quick Action Modal states
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [pendingViewMode, setPendingViewMode] = useState<'cards' | 'table'>('cards');

  const { subscribeToUpdates } = useSocket();

  const fetchStats = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await api.get('/admin/dashboard');
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    // Subscribe to realtime updates to auto-refresh KPI counts
    const unsubscribe = subscribeToUpdates(() => {
      fetchStats(true);
    });
    return () => unsubscribe();
  }, [fetchStats, subscribeToUpdates]);

  const handleApprove = async () => {
    if (!activeBooking) return;
    setActionLoading(true);
    setActionError('');

    try {
      const res = await api.patch(`/admin/bookings/${activeBooking._id}/approve`);
      if (res.data?.success) {
        setApproveModalOpen(false);
        fetchStats(true);
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to approve booking.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!activeBooking) return;
    setActionLoading(true);
    setActionError('');

    try {
      const res = await api.patch(`/admin/bookings/${activeBooking._id}/reject`, {
        reason: rejectionReason.trim(),
      });
      if (res.data?.success) {
        setRejectModalOpen(false);
        fetchStats(true);
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to reject booking.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-purple-900/40">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-amber-400 mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Sanctuary Overseer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100">
              Admin Overview & Operations
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Live consultation metrics, pending approvals, and scheduled sessions
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => fetchStats(true)}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-purple-300 hover:text-amber-300 hover:border-purple-600 transition-colors"
              title="Refresh Stats"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <Link to="/admin/slots">
              <Button variant="secondary" size="sm">
                Manage Slots
              </Button>
            </Link>
            <Link to="/admin/bookings">
              <Button variant="gold" size="sm">
                All Bookings
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="py-24">
            <LoadingSpinner message="Querying sanctuary metrics..." />
          </div>
        ) : (
          <>
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-[#140e30]/90 border border-purple-900/40 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Pending Requests
                  </span>
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-serif font-bold text-amber-300 mt-3">
                  {stats?.pendingCount ?? 0}
                </div>
                <p className="text-xs text-amber-400/80 mt-1">Action required (under 30s workflow)</p>
              </div>

              <div className="p-6 rounded-2xl bg-[#140e30]/90 border border-purple-900/40 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Approved Bookings
                  </span>
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-serif font-bold text-emerald-300 mt-3">
                  {stats?.approvedCount ?? 0}
                </div>
                <p className="text-xs text-slate-400 mt-1">Confirmed & scheduled</p>
              </div>

              <div className="p-6 rounded-2xl bg-[#140e30]/90 border border-purple-900/40 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Total Bookings
                  </span>
                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-serif font-bold text-purple-200 mt-3">
                  {stats?.totalBookings ?? 0}
                </div>
                <p className="text-xs text-slate-400 mt-1">Lifetime consultations</p>
              </div>

              <div className="p-6 rounded-2xl bg-[#140e30]/90 border border-purple-900/40 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Registered Clients
                  </span>
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-serif font-bold text-indigo-200 mt-3">
                  {stats?.totalUsers ?? 0}
                </div>
                <p className="text-xs text-slate-400 mt-1">Active seekers</p>
              </div>
            </div>

            {/* Pending Requests Section — Approval Station */}
            <div className="rounded-2xl bg-[#140e30]/95 border border-purple-900/50 overflow-hidden shadow-2xl">
              <div className="px-6 py-4 border-b border-purple-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#100a26]">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  <h3 className="font-serif font-bold text-lg text-slate-100">
                    Consultation Approvals Station
                  </h3>
                  {stats?.pendingCount ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs border border-amber-500/40 font-semibold shadow-glow">
                      {stats.pendingCount} Awaiting Review
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center gap-3">
                  {stats?.recentPending && stats.recentPending.length > 0 && (
                    <div className="flex items-center bg-[#0b081b] p-1 rounded-xl border border-purple-800/40">
                      <button
                        type="button"
                        onClick={() => setPendingViewMode('cards')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          pendingViewMode === 'cards'
                            ? 'bg-purple-900 text-amber-300 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        <span>Cards</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingViewMode('table')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          pendingViewMode === 'table'
                            ? 'bg-purple-900 text-amber-300 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <List className="w-3.5 h-3.5" />
                        <span>Table</span>
                      </button>
                    </div>
                  )}

                  <Link
                    to="/admin/bookings?status=PENDING"
                    className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
                  >
                    <span>View all bookings</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {stats?.recentPending && stats.recentPending.length > 0 ? (
                pendingViewMode === 'cards' ? (
                  /* Cards View: Rich, High-Impact Approval Workspace */
                  <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {stats.recentPending.map((b) => (
                      <div
                        key={b._id}
                        className="rounded-2xl bg-[#0f0924]/90 border border-purple-800/50 p-5 flex flex-col justify-between hover:border-amber-400/50 transition-all duration-200 shadow-lg relative group"
                      >
                        <div className="space-y-4">
                          {/* Seeker Info Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-700 to-amber-600 flex items-center justify-center text-white font-serif font-bold text-base shadow-md">
                                {b.userId?.name ? b.userId.name.charAt(0).toUpperCase() : 'S'}
                              </div>
                              <div>
                                <h4 className="font-serif font-bold text-slate-100 text-base group-hover:text-amber-300 transition-colors">
                                  {b.userId?.name || 'Anonymous Seeker'}
                                </h4>
                                <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-400">
                                  <span className="flex items-center gap-1 font-mono text-[11px] text-purple-300">
                                    <Mail className="w-3 h-3 text-purple-400" />
                                    {b.userId?.email}
                                  </span>
                                  {b.userId?.phone && (
                                    <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                                      <Phone className="w-3 h-3 text-slate-500" />
                                      {b.userId.phone}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
                              PENDING
                            </span>
                          </div>

                          {/* Reading & Slot Badges */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                            <div className="p-3 rounded-xl bg-[#160d36] border border-purple-900/40">
                              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 block mb-0.5">
                                Reading Spread
                              </span>
                              <div className="font-serif font-bold text-slate-100 text-sm">
                                {b.readingTypeId?.name}
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-xs">
                                <span className="text-purple-300 font-mono">
                                  {b.readingTypeId?.duration} mins
                                </span>
                                <span className="text-slate-500">•</span>
                                <span className="font-serif font-bold text-amber-300">
                                  ₹{b.readingTypeId?.price}
                                </span>
                              </div>
                            </div>

                            <div className="p-3 rounded-xl bg-[#160d36] border border-purple-900/40">
                              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 block mb-0.5">
                                Scheduled Time
                              </span>
                              <div className="font-mono text-slate-100 text-xs font-semibold flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                                {b.slotId?.date}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1 font-mono text-xs text-amber-300">
                                <Clock className="w-3.5 h-3.5 text-amber-400/70" />
                                {b.slotId?.startTime} - {b.slotId?.endTime}
                              </div>
                            </div>
                          </div>

                          {/* Notes / Client Question */}
                          {b.notes && (
                            <div className="p-3 rounded-xl bg-[#130b2c] border border-purple-900/50 text-xs">
                              <div className="flex items-center gap-1.5 text-purple-300 font-mono text-[10px] uppercase tracking-wider mb-1">
                                <MessageSquare className="w-3 h-3 text-purple-400" />
                                <span>Seeker's Focus / Intentions:</span>
                              </div>
                              <p className="text-slate-300 italic line-clamp-3 leading-relaxed">
                                "{b.notes}"
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Action Footer */}
                        <div className="flex items-center justify-between gap-3 pt-4 mt-4 border-t border-purple-900/40">
                          <span className="text-[10px] font-mono text-slate-500">
                            ID: #{b._id.substring(b._id.length - 8).toUpperCase()}
                          </span>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                setActiveBooking(b);
                                setRejectionReason('');
                                setActionError('');
                                setRejectModalOpen(true);
                              }}
                              className="text-xs"
                            >
                              <X className="w-3.5 h-3.5 mr-1" />
                              <span>Decline</span>
                            </Button>

                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                setActiveBooking(b);
                                setActionError('');
                                setApproveModalOpen(true);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow text-xs px-3.5"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              <span>Approve Consultation</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Table View */
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="bg-[#0e0921] text-[11px] font-mono uppercase tracking-wider text-purple-300 border-b border-purple-900/30">
                        <tr>
                          <th className="px-6 py-3.5">Client</th>
                          <th className="px-6 py-3.5">Reading Type</th>
                          <th className="px-6 py-3.5">Date & Slot</th>
                          <th className="px-6 py-3.5">Notes</th>
                          <th className="px-6 py-3.5 text-right">Quick Decision</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-purple-950/60 font-sans">
                        {stats.recentPending.map((b) => (
                          <tr key={b._id} className="hover:bg-purple-950/20 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-serif font-semibold text-slate-100">
                                {b.userId?.name}
                              </div>
                              <div className="text-xs text-slate-400 font-mono">
                                {b.userId?.email}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-serif text-slate-200">
                              {b.readingTypeId?.name}
                              <span className="text-xs text-amber-400 block font-mono">
                                ₹{b.readingTypeId?.price}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-xs font-semibold text-slate-200">
                                {b.slotId?.date}
                              </div>
                              <div className="text-xs text-purple-300 font-mono">
                                {b.slotId?.startTime} - {b.slotId?.endTime}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-400 max-w-xs truncate">
                              {b.notes || 'No specific focus notes'}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => {
                                    setActiveBooking(b);
                                    setActionError('');
                                    setApproveModalOpen(true);
                                  }}
                                  className="bg-emerald-700 hover:bg-emerald-600 border-emerald-500/40 text-white"
                                >
                                  <Check className="w-3.5 h-3.5 mr-1" />
                                  <span>Approve</span>
                                </Button>

                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => {
                                    setActiveBooking(b);
                                    setRejectionReason('');
                                    setActionError('');
                                    setRejectModalOpen(true);
                                  }}
                                >
                                  <X className="w-3.5 h-3.5 mr-1" />
                                  <span>Reject</span>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                /* Tranquil, Mystical Empty State */
                <div className="p-14 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-purple-950/80 border border-purple-700/40 flex items-center justify-center mx-auto mb-4 text-purple-300 shadow-glow-purple">
                    <ShieldCheck className="w-7 h-7 text-amber-400" />
                  </div>
                  <h4 className="font-serif font-bold text-lg text-slate-100">
                    Sanctuary In Harmony • No Pending Approvals
                  </h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1.5 leading-relaxed">
                    All consultation requests have been processed. When a client books a slot, their request will appear here immediately for approval.
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Approve Modal */}
        <Modal
          isOpen={approveModalOpen}
          onClose={() => setApproveModalOpen(false)}
          title="Confirm Booking Approval"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-300">
              Are you sure you want to approve this booking?
            </p>

            <div className="p-4 rounded-xl bg-[#100a26] border border-purple-800/40 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Client:</span>
                <span className="font-semibold text-slate-100">{activeBooking?.userId?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Reading:</span>
                <span className="font-semibold text-amber-300">{activeBooking?.readingTypeId?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date:</span>
                <span className="font-mono text-slate-200">{activeBooking?.slotId?.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Time:</span>
                <span className="font-mono text-slate-200">
                  {activeBooking?.slotId?.startTime} - {activeBooking?.slotId?.endTime}
                </span>
              </div>
            </div>

            {actionError && (
              <div className="p-3 rounded-lg bg-red-950/70 border border-red-700/50 text-xs text-red-200">
                {actionError}
              </div>
            )}

            <p className="text-[11px] text-slate-400">
              This will transition the slot to BOOKED, update the booking state to APPROVED, send an approval email, and signal the client dashboard in real time.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setApproveModalOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="gold"
                size="sm"
                onClick={handleApprove}
                isLoading={actionLoading}
              >
                Confirm Approval
              </Button>
            </div>
          </div>
        </Modal>

        {/* Reject Modal */}
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title="Confirm Booking Rejection"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-300">
              Are you sure you want to reject this booking for{' '}
              <span className="text-amber-300 font-semibold">{activeBooking?.userId?.name}</span>?
            </p>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-purple-200 mb-1">
                Optional Rejection Reason
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Reader unavailable during this slot, please select another..."
                className="w-full px-3 py-2 bg-[#120c29] border border-purple-800/60 rounded-lg text-xs text-slate-100 outline-none focus:border-amber-400"
              />
            </div>

            {actionError && (
              <div className="p-3 rounded-lg bg-red-950/70 border border-red-700/50 text-xs text-red-200">
                {actionError}
              </div>
            )}

            <p className="text-[11px] text-slate-400">
              Rejecting will release the slot back to AVAILABLE for other seekers.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectModalOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleReject}
                isLoading={actionLoading}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
};
