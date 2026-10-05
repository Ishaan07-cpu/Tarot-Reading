import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { Booking, ReadingType, AuditLog } from '../../types';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Search,
  Filter,
  Eye,
  Check,
  X,
  CheckCircle,
  Ban,
  Calendar,
  Clock,
  User as UserIcon,
  ShieldCheck,
  RefreshCw,
  Mail,
  Phone,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export const AdminBookingsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'ALL';

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [readingTypes, setReadingTypes] = useState<ReadingType[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [readingTypeFilter, setReadingTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Modals & Active booking
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<{
    booking: Booking;
    auditLogs: AuditLog[];
  } | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const [targetBooking, setTargetBooking] = useState<Booking | null>(null);
  const [reasonInput, setReasonInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const { subscribeToUpdates } = useSocket();

  const fetchBookings = useCallback(async () => {
    try {
      const params: any = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (readingTypeFilter !== 'ALL') params.readingTypeId = readingTypeFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (dateFilter) params.date = dateFilter;

      const res = await api.get('/admin/bookings', { params });
      if (res.data?.success) {
        setBookings(res.data.data.bookings);
      }
    } catch (err) {
      console.error('Failed to load admin bookings', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, readingTypeFilter, searchQuery, dateFilter]);

  // Load reading types catalog for filter
  useEffect(() => {
    const loadTypes = async () => {
      try {
        const res = await api.get('/admin/reading-types');
        if (res.data?.success) setReadingTypes(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    loadTypes();
  }, []);

  useEffect(() => {
    fetchBookings();
    const unsub = subscribeToUpdates(() => {
      fetchBookings();
    });
    return () => unsub();
  }, [fetchBookings, subscribeToUpdates]);

  const openDetails = async (bookingId: string) => {
    setDetailsLoading(true);
    try {
      const res = await api.get(`/admin/bookings/${bookingId}`);
      if (res.data?.success) {
        setSelectedBookingDetails(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!targetBooking) return;
    setActionLoading(true);
    setActionError('');
    try {
      const res = await api.patch(`/admin/bookings/${targetBooking._id}/approve`);
      if (res.data?.success) {
        setApproveModalOpen(false);
        fetchBookings();
        if (selectedBookingDetails?.booking._id === targetBooking._id) {
          openDetails(targetBooking._id);
        }
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!targetBooking) return;
    setActionLoading(true);
    setActionError('');
    try {
      const res = await api.patch(`/admin/bookings/${targetBooking._id}/reject`, {
        reason: reasonInput.trim(),
      });
      if (res.data?.success) {
        setRejectModalOpen(false);
        fetchBookings();
        if (selectedBookingDetails?.booking._id === targetBooking._id) {
          openDetails(targetBooking._id);
        }
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Rejection failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!targetBooking) return;
    setActionLoading(true);
    setActionError('');
    try {
      const res = await api.patch(`/admin/bookings/${targetBooking._id}/complete`);
      if (res.data?.success) {
        setCompleteModalOpen(false);
        fetchBookings();
        if (selectedBookingDetails?.booking._id === targetBooking._id) {
          openDetails(targetBooking._id);
        }
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Completion update failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!targetBooking) return;
    setActionLoading(true);
    setActionError('');
    try {
      const res = await api.patch(`/admin/bookings/${targetBooking._id}/cancel`, {
        reason: reasonInput.trim(),
      });
      if (res.data?.success) {
        setCancelModalOpen(false);
        fetchBookings();
        if (selectedBookingDetails?.booking._id === targetBooking._id) {
          openDetails(targetBooking._id);
        }
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Cancellation failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-purple-900/40">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100">
              Booking Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Filter, inspect, and transition consultation states
            </p>
          </div>

          <button
            onClick={fetchBookings}
            className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-purple-300 hover:text-amber-300 transition-colors self-start sm:self-auto"
            title="Refresh bookings"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Status Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'ALL', label: 'All Consultations' },
            { id: 'PENDING', label: 'Pending Approval', highlight: true },
            { id: 'APPROVED', label: 'Approved & Scheduled' },
            { id: 'COMPLETED', label: 'Completed' },
            { id: 'CANCELLED', label: 'Cancelled' },
            { id: 'REJECTED', label: 'Rejected' },
          ].map((tab) => {
            const count =
              tab.id === 'ALL'
                ? bookings.length
                : bookings.filter((b) => b.status === tab.id).length;
            const isSelected = statusFilter === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? tab.highlight
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-glow border border-amber-300'
                      : 'bg-purple-900 text-amber-300 font-semibold border border-purple-700 shadow-sm'
                    : 'bg-[#140e30]/80 text-slate-400 border border-purple-900/40 hover:text-slate-200 hover:border-purple-700'
                }`}
              >
                <span>{tab.label}</span>
                {count > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono leading-none ${
                      isSelected
                        ? tab.highlight
                          ? 'bg-slate-900 text-amber-300 font-bold'
                          : 'bg-purple-950 text-amber-200'
                        : 'bg-purple-950/80 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 rounded-2xl bg-[#140e30]/80 border border-purple-900/40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search client, email, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#100a26] border border-purple-800/60 rounded-xl text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-amber-400"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#100a26] border border-purple-800/60 rounded-xl text-xs font-mono uppercase tracking-wider text-slate-200 outline-none focus:border-amber-400"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* Reading Type Filter */}
          <select
            value={readingTypeFilter}
            onChange={(e) => setReadingTypeFilter(e.target.value)}
            className="px-3 py-2 bg-[#100a26] border border-purple-800/60 rounded-xl text-xs text-slate-200 outline-none focus:border-amber-400"
          >
            <option value="ALL">All Reading Spreads</option>
            {readingTypes.map((rt) => (
              <option key={rt._id} value={rt._id}>
                {rt.name}
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 bg-[#100a26] border border-purple-800/60 rounded-xl text-xs text-slate-200 outline-none focus:border-amber-400"
          />
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="py-24">
            <LoadingSpinner message="Retrieving sanctuary records..." />
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-16 text-center rounded-2xl bg-[#140e30]/80 border border-purple-900/40">
            <Calendar className="w-10 h-10 text-purple-500/50 mx-auto mb-3" />
            <h3 className="text-base font-serif font-semibold text-slate-200">
              No bookings matching criteria
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search query or filters.
            </p>
          </div>
        ) : statusFilter === 'PENDING' ? (
          /* High-Impact Approval Cards when filtering for Pending */
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400">
                Awaiting Review ({bookings.length})
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {bookings.map((b) => (
                <div
                  key={b._id}
                  className="rounded-2xl bg-[#140e30]/95 border border-purple-900/50 p-5 flex flex-col justify-between hover:border-amber-400/50 transition-all duration-200 shadow-xl"
                >
                  <div className="space-y-4">
                    {/* Header: Seeker info */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-700 to-amber-600 flex items-center justify-center text-white font-serif font-bold text-base shadow-md">
                          {b.userId?.name ? b.userId.name.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <div>
                          <h4 className="font-serif font-bold text-slate-100 text-base">
                            {b.userId?.name || 'Seeker'}
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

                      <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold">
                        AWAITING REVIEW
                      </span>
                    </div>

                    {/* Reading details & Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      <div className="p-3 rounded-xl bg-[#100a26] border border-purple-900/40">
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

                      <div className="p-3 rounded-xl bg-[#100a26] border border-purple-900/40">
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

                    {/* Notes */}
                    {b.notes && (
                      <div className="p-3 rounded-xl bg-[#100a26] border border-purple-900/40 text-xs">
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

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-3 pt-4 mt-4 border-t border-purple-900/40">
                    <button
                      type="button"
                      onClick={() => openDetails(b._id)}
                      className="text-xs text-purple-300 hover:text-white flex items-center gap-1 font-mono"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details & Logs</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setTargetBooking(b);
                          setReasonInput('');
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
                          setTargetBooking(b);
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
          </div>
        ) : (
          /* Table View for All / Other Statuses */
          <div className="rounded-2xl bg-[#140e30]/90 border border-purple-900/40 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-[#0e0921] text-[11px] font-mono uppercase tracking-wider text-purple-300 border-b border-purple-900/30">
                  <tr>
                    <th className="px-5 py-3.5">Booking ID</th>
                    <th className="px-5 py-3.5">Client</th>
                    <th className="px-5 py-3.5">Reading Type</th>
                    <th className="px-5 py-3.5">Date & Time</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Permitted Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-950/60">
                  {bookings.map((b) => (
                    <tr key={b._id} className="hover:bg-purple-950/20 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs text-amber-400">
                        #{b._id.substring(b._id.length - 8).toUpperCase()}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-serif font-semibold text-slate-100">
                          {b.userId?.name}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          {b.userId?.email}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-serif text-slate-200">
                        {b.readingTypeId?.name}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-xs font-semibold text-slate-200">
                          {b.slotId?.date}
                        </div>
                        <div className="text-xs text-purple-300 font-mono">
                          {b.slotId?.startTime} - {b.slotId?.endTime}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge status={b.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* View Details always available */}
                          <Button
                            variant="ghost"
                            size="sm"
                            title="View Details & Audit Trail"
                            onClick={() => openDetails(b._id)}
                          >
                            <Eye className="w-4 h-4 text-purple-300" />
                          </Button>

                          {/* PENDING: Approve / Reject */}
                          {b.status === 'PENDING' && (
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  setTargetBooking(b);
                                  setActionError('');
                                  setApproveModalOpen(true);
                                }}
                                className="bg-emerald-800 hover:bg-emerald-700 text-xs px-2.5 py-1"
                              >
                                <Check className="w-3.5 h-3.5 mr-1" />
                                Approve
                              </Button>

                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                  setTargetBooking(b);
                                  setReasonInput('');
                                  setActionError('');
                                  setRejectModalOpen(true);
                                }}
                                className="text-xs px-2.5 py-1"
                              >
                                <X className="w-3.5 h-3.5 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}

                          {/* APPROVED: Complete / Cancel */}
                          {b.status === 'APPROVED' && (
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  setTargetBooking(b);
                                  setActionError('');
                                  setCompleteModalOpen(true);
                                }}
                                className="bg-purple-700 hover:bg-purple-600 text-xs px-2.5 py-1"
                              >
                                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                Complete
                              </Button>

                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                  setTargetBooking(b);
                                  setReasonInput('');
                                  setActionError('');
                                  setCancelModalOpen(true);
                                }}
                                className="text-xs px-2.5 py-1"
                              >
                                <Ban className="w-3.5 h-3.5 mr-1" />
                                Cancel
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detailed Booking Drawer / Modal */}
        <Modal
          isOpen={!!selectedBookingDetails}
          onClose={() => setSelectedBookingDetails(null)}
          title="Booking Details & History"
          maxWidth="lg"
        >
          {selectedBookingDetails && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                    Booking ID
                  </span>
                  <span className="font-mono text-xs text-amber-300">
                    {selectedBookingDetails.booking._id}
                  </span>
                </div>
                <Badge status={selectedBookingDetails.booking.status} />
              </div>

              {/* Client Info */}
              <div className="p-4 rounded-xl bg-[#100a26] border border-purple-800/40 space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-purple-300 block mb-1">
                  Client Information
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Name:</span>{' '}
                    <span className="text-slate-200 font-semibold">
                      {selectedBookingDetails.booking.userId?.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Email:</span>{' '}
                    <span className="text-slate-200 font-mono">
                      {selectedBookingDetails.booking.userId?.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Phone:</span>{' '}
                    <span className="text-slate-200 font-mono">
                      {selectedBookingDetails.booking.userId?.phone || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Consultation Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#100a26] border border-purple-800/40">
                  <span className="text-slate-400 block mb-0.5">Reading Type</span>
                  <span className="font-serif font-bold text-slate-100">
                    {selectedBookingDetails.booking.readingTypeId?.name}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#100a26] border border-purple-800/40">
                  <span className="text-slate-400 block mb-0.5">Price & Time</span>
                  <span className="font-serif font-bold text-amber-300">
                    ₹{selectedBookingDetails.booking.readingTypeId?.price} (
                    {selectedBookingDetails.booking.slotId?.startTime} -{' '}
                    {selectedBookingDetails.booking.slotId?.endTime})
                  </span>
                </div>
              </div>

              {selectedBookingDetails.booking.notes && (
                <div className="p-3.5 rounded-xl bg-[#100a26] border border-purple-800/40">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-1">
                    Client Intentions & Focus
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {selectedBookingDetails.booking.notes}
                  </p>
                </div>
              )}

              {/* Audit Log Trail */}
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-purple-300 block mb-2">
                  Sacred Audit Log Trail
                </span>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedBookingDetails.auditLogs.map((log) => (
                    <div
                      key={log._id}
                      className="p-3 rounded-xl bg-[#0d0821] border border-purple-950 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono text-amber-300 font-semibold">
                          {log.action}
                        </span>
                        <div className="text-[11px] text-slate-400">
                          by {log.actorId?.name || 'System'} ({log.actorRole})
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Approve Modal */}
        <Modal
          isOpen={approveModalOpen}
          onClose={() => setApproveModalOpen(false)}
          title="Approve Booking"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-300">
              Approve booking for{' '}
              <strong className="text-amber-300">{targetBooking?.userId?.name}</strong> on{' '}
              {targetBooking?.slotId?.date}?
            </p>
            {actionError && (
              <div className="p-3 rounded-lg bg-red-950/70 border border-red-700/50 text-xs text-red-200">
                {actionError}
              </div>
            )}
            <div className="flex justify-end gap-3 pt-3">
              <Button variant="outline" size="sm" onClick={() => setApproveModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="gold" size="sm" onClick={handleApprove} isLoading={actionLoading}>
                Confirm Approval
              </Button>
            </div>
          </div>
        </Modal>

        {/* Reject Modal */}
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title="Reject Booking"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-300">
              Reject booking for{' '}
              <strong className="text-amber-300">{targetBooking?.userId?.name}</strong>?
            </p>
            <textarea
              rows={3}
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
              placeholder="Reason for rejection (optional)..."
              className="w-full px-3 py-2 bg-[#120c29] border border-purple-800/60 rounded-lg text-xs text-slate-100 outline-none"
            />
            {actionError && (
              <div className="p-3 rounded-lg bg-red-950/70 border border-red-700/50 text-xs text-red-200">
                {actionError}
              </div>
            )}
            <div className="flex justify-end gap-3 pt-3">
              <Button variant="outline" size="sm" onClick={() => setRejectModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleReject} isLoading={actionLoading}>
                Confirm Rejection
              </Button>
            </div>
          </div>
        </Modal>

        {/* Complete Modal */}
        <Modal
          isOpen={completeModalOpen}
          onClose={() => setCompleteModalOpen(false)}
          title="Mark Session Completed"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-300">
              Mark reading for{' '}
              <strong className="text-amber-300">{targetBooking?.userId?.name}</strong> as COMPLETED?
            </p>
            <p className="text-xs text-slate-400">
              This moves the booking to historical archives and concludes the consultation.
            </p>
            {actionError && (
              <div className="p-3 rounded-lg bg-red-950/70 border border-red-700/50 text-xs text-red-200">
                {actionError}
              </div>
            )}
            <div className="flex justify-end gap-3 pt-3">
              <Button variant="outline" size="sm" onClick={() => setCompleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="gold" size="sm" onClick={handleComplete} isLoading={actionLoading}>
                Mark Completed
              </Button>
            </div>
          </div>
        </Modal>

        {/* Cancel Modal */}
        <Modal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          title="Cancel Booking"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-300">
              Cancel confirmed booking for{' '}
              <strong className="text-amber-300">{targetBooking?.userId?.name}</strong>?
            </p>
            <textarea
              rows={3}
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
              placeholder="Reason for cancellation (optional)..."
              className="w-full px-3 py-2 bg-[#120c29] border border-purple-800/60 rounded-lg text-xs text-slate-100 outline-none"
            />
            {actionError && (
              <div className="p-3 rounded-lg bg-red-950/70 border border-red-700/50 text-xs text-red-200">
                {actionError}
              </div>
            )}
            <div className="flex justify-end gap-3 pt-3">
              <Button variant="outline" size="sm" onClick={() => setCancelModalOpen(false)}>
                Keep
              </Button>
              <Button variant="danger" size="sm" onClick={handleCancel} isLoading={actionLoading}>
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
};
