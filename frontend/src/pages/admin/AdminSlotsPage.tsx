import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { api } from '../../services/api';
import { Slot } from '../../types';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  RefreshCw,
  Ban,
  CheckCircle2,
  LayoutGrid,
  List,
  Sparkles,
  Filter,
  Check,
  Eye,
  AlertCircle,
  EyeOff,
} from 'lucide-react';

const TIME_PRESETS = [
  { label: 'Morning', startTime: '10:00', endTime: '10:45' },
  { label: 'Midday', startTime: '11:30', endTime: '12:15' },
  { label: 'Afternoon', startTime: '14:00', endTime: '14:45' },
  { label: 'Late Afternoon', startTime: '16:00', endTime: '16:45' },
  { label: 'Evening', startTime: '18:00', endTime: '18:45' },
  { label: 'Night', startTime: '19:30', endTime: '20:15' },
];

export const AdminSlotsPage: React.FC = () => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grouped' | 'table'>('grouped');
  const [hideEmptySlots, setHideEmptySlots] = useState(false);

  // Create Slot Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newSlot, setNewSlot] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '10:45',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [batchLoading, setBatchLoading] = useState(false);

  const fetchSlots = useCallback(async () => {
    try {
      const params: any = {};
      if (dateFilter) params.date = dateFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res = await api.get('/admin/slots', { params });
      if (res.data?.success) {
        setSlots(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load slots', err);
    } finally {
      setLoading(false);
    }
  }, [dateFilter, statusFilter]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  // Group slots by date and filter if hideEmptySlots is active
  const groupedDates = useMemo(() => {
    const map: { [date: string]: Slot[] } = {};
    for (const s of slots) {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    }

    const sortedDates = Object.keys(map).sort();

    return sortedDates
      .map((date) => {
        const daySlots = map[date].sort((a, b) => a.startTime.localeCompare(b.startTime));
        const available = daySlots.filter((s) => s.status === 'AVAILABLE');
        const booked = daySlots.filter((s) => s.status === 'BOOKED');
        const held = daySlots.filter((s) => s.status === 'HELD');
        const disabled = daySlots.filter((s) => s.status === 'DISABLED');

        return {
          date,
          slots: hideEmptySlots ? daySlots.filter((s) => s.status !== 'AVAILABLE') : daySlots,
          allSlots: daySlots,
          availableCount: available.length,
          bookedCount: booked.length,
          heldCount: held.length,
          disabledCount: disabled.length,
          hasActiveBookings: booked.length > 0 || held.length > 0,
        };
      })
      .filter((group) => {
        if (!hideEmptySlots) return true;
        // If hideEmptySlots is active, only show dates that have active/held slots
        return group.hasActiveBookings;
      });
  }, [slots, hideEmptySlots]);

  // Filtered slots for table view
  const tableSlots = useMemo(() => {
    if (!hideEmptySlots) return slots;
    return slots.filter((s) => s.status !== 'AVAILABLE');
  }, [slots, hideEmptySlots]);

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');

    try {
      const res = await api.post('/admin/slots', newSlot);
      if (res.data?.success) {
        setCreateModalOpen(false);
        fetchSlots();
      }
    } catch (err: any) {
      setCreateError(err.response?.data?.message || 'Failed to create slot.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleBatchGenerateDay = async (targetDate: string) => {
    if (!window.confirm(`Generate standard consultation slots for ${targetDate}?`)) return;
    setBatchLoading(true);
    try {
      for (const preset of TIME_PRESETS.slice(0, 4)) {
        try {
          await api.post('/admin/slots', {
            date: targetDate,
            startTime: preset.startTime,
            endTime: preset.endTime,
          });
        } catch {
          // Ignore overlap or duplicate errors during batch
        }
      }
      fetchSlots();
    } finally {
      setBatchLoading(false);
    }
  };

  const handleToggleStatus = async (slot: Slot) => {
    const nextStatus = slot.status === 'DISABLED' ? 'AVAILABLE' : 'DISABLED';
    try {
      await api.patch(`/admin/slots/${slot._id}`, { status: nextStatus });
      fetchSlots();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Cannot update status');
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!window.confirm('Are you sure you want to delete this slot?')) return;
    try {
      await api.delete(`/admin/slots/${slotId}`);
      fetchSlots();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete slot');
    }
  };

  const handleClearEmptySlotsForDate = async (targetDate: string, daySlots: Slot[]) => {
    const emptySlots = daySlots.filter((s) => s.status === 'AVAILABLE');
    if (emptySlots.length === 0) {
      alert('No empty slots to remove on this date.');
      return;
    }

    if (
      !window.confirm(
        `Remove all ${emptySlots.length} available/empty slots for ${targetDate}? Reserved or booked slots will not be touched.`
      )
    ) {
      return;
    }

    try {
      for (const s of emptySlots) {
        await api.delete(`/admin/slots/${s._id}`);
      }
      fetchSlots();
    } catch (err: any) {
      alert('Error clearing some slots.');
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const tomorrowDate = new Date();
      tomorrowDate.setDate(tomorrowDate.getDate() + 1);
      const tomorrow = tomorrowDate.toISOString().split('T')[0];

      const d = new Date(dateStr + 'T00:00:00');
      const formatted = d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });

      if (dateStr === today) return { label: `${formatted}`, badge: 'Today' };
      if (dateStr === tomorrow) return { label: `${formatted}`, badge: 'Tomorrow' };
      return { label: formatted, badge: null };
    } catch {
      return { label: dateStr, badge: null };
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-purple-900/40">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-amber-400 mb-1">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Sanctuary Schedule</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100">
              Slots & Calendar Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Publish consultation slots, monitor reservations, and organize your calendar effortlessly
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={fetchSlots}
              className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-purple-300 hover:text-amber-300 transition-colors"
              title="Refresh slots"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* View Switcher: Grouped vs Table */}
            <div className="flex items-center bg-[#0b081b] p-1 rounded-xl border border-purple-800/40">
              <button
                type="button"
                onClick={() => setViewMode('grouped')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'grouped'
                    ? 'bg-purple-900 text-amber-300 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Day Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'table'
                    ? 'bg-purple-900 text-amber-300 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Full Table</span>
              </button>
            </div>

            <Button
              variant="gold"
              size="md"
              onClick={() => {
                setCreateError('');
                setCreateModalOpen(true);
              }}
              className="flex items-center gap-1.5 shadow-glow"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Slot</span>
            </Button>
          </div>
        </div>

        {/* Filter Toolbar & Clutter Reducer */}
        <div className="p-4 rounded-2xl bg-[#140e30]/90 border border-purple-900/40 flex flex-wrap items-center justify-between gap-4 shadow-md">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-purple-300">Date:</span>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-1.5 bg-[#100a26] border border-purple-800/60 rounded-xl text-xs text-slate-100 outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-purple-300">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-[#100a26] border border-purple-800/60 rounded-xl text-xs font-mono text-slate-200 outline-none focus:border-amber-400"
              >
                <option value="ALL">All Statuses</option>
                <option value="AVAILABLE">AVAILABLE (Open)</option>
                <option value="HELD">HELD (Reserved)</option>
                <option value="BOOKED">BOOKED (Confirmed)</option>
                <option value="DISABLED">DISABLED (Off)</option>
              </select>
            </div>

            {(dateFilter || statusFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setDateFilter('');
                  setStatusFilter('ALL');
                }}
                className="text-xs text-amber-400 hover:underline font-mono"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Quick Toggle: Hide Empty Slots */}
          <button
            type="button"
            onClick={() => setHideEmptySlots(!hideEmptySlots)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              hideEmptySlots
                ? 'bg-amber-400/20 text-amber-300 border-amber-400/50 shadow-glow'
                : 'bg-[#100a26] text-slate-300 border-purple-800/50 hover:border-purple-600'
            }`}
          >
            {hideEmptySlots ? (
              <EyeOff className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Eye className="w-3.5 h-3.5 text-purple-400" />
            )}
            <span>
              {hideEmptySlots ? 'Showing Active Slots Only' : 'Hide Empty / Available Slots'}
            </span>
            {hideEmptySlots && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse ml-0.5" />
            )}
          </button>
        </div>

        {/* Content View */}
        {loading ? (
          <div className="py-24">
            <LoadingSpinner message="Loading sanctuary schedule..." />
          </div>
        ) : slots.length === 0 ? (
          <div className="p-16 text-center rounded-2xl bg-[#140e30]/80 border border-purple-900/40">
            <Clock className="w-12 h-12 text-purple-500/40 mx-auto mb-3" />
            <h3 className="text-lg font-serif font-bold text-slate-200">
              No Consultation Slots Found
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-6">
              Your calendar is completely clean. Create available slots so seekers can book consultations with you.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="gold"
                size="sm"
                onClick={() => setCreateModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Create First Slot
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBatchGenerateDay(new Date().toISOString().split('T')[0])}
                disabled={batchLoading}
              >
                <Sparkles className="w-4 h-4 mr-1 text-amber-400" />
                Generate Today's Standard Slots
              </Button>
            </div>
          </div>
        ) : viewMode === 'grouped' ? (
          /* Day Cards View: Clean, uncluttered, intuitive grouping by date */
          groupedDates.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#140e30]/60 border border-purple-900/40">
              <CheckCircle2 className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <h4 className="font-serif font-bold text-slate-200">
                All Slots Are Currently Empty / Available
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                You have "Hide Empty Slots" turned on. Turn it off to view all open slots, or create a test booking.
              </p>
              <button
                onClick={() => setHideEmptySlots(false)}
                className="mt-4 px-4 py-1.5 rounded-xl bg-purple-900/60 border border-purple-700/50 text-xs text-amber-300 hover:text-white"
              >
                Show All Available Slots
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedDates.map((day) => {
                const dateDisplay = formatDateDisplay(day.date);
                return (
                  <div
                    key={day.date}
                    className="rounded-2xl bg-[#140e30]/95 border border-purple-900/40 overflow-hidden shadow-lg hover:border-purple-800/80 transition-all"
                  >
                    {/* Day Header Bar */}
                    <div className="px-6 py-3.5 bg-[#100a26] border-b border-purple-900/40 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800/60 flex items-center justify-center text-purple-300">
                          <Calendar className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-bold text-slate-100 text-sm sm:text-base">
                              {dateDisplay.label}
                            </span>
                            <span className="font-mono text-xs text-purple-400">
                              ({day.date})
                            </span>
                            {dateDisplay.badge && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono text-[10px] font-semibold border border-amber-400/40">
                                {dateDisplay.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Day Stats & Action Toolbar */}
                      <div className="flex items-center gap-2">
                        {day.bookedCount > 0 && (
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-900/80 text-amber-300 font-mono text-xs border border-purple-700/60 font-semibold">
                            {day.bookedCount} Booked
                          </span>
                        )}
                        {day.heldCount > 0 && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs border border-amber-500/40">
                            {day.heldCount} Held
                          </span>
                        )}
                        {day.availableCount > 0 && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-xs border border-emerald-500/30">
                            {day.availableCount} Open
                          </span>
                        )}

                        <div className="h-4 w-px bg-purple-900/60 mx-1" />

                        {/* Quick Add Slot for this Day */}
                        <button
                          type="button"
                          onClick={() => {
                            setNewSlot((prev) => ({ ...prev, date: day.date }));
                            setCreateError('');
                            setCreateModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-purple-950/80 border border-purple-800/50 hover:border-amber-400/50 text-[11px] font-mono text-purple-300 hover:text-amber-300 transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Slot</span>
                        </button>

                        {/* Clear empty slots for this day */}
                        {day.availableCount > 0 && (
                          <button
                            type="button"
                            onClick={() => handleClearEmptySlotsForDate(day.date, day.allSlots)}
                            className="p-1 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                            title={`Clear ${day.availableCount} empty slots for this day`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Time Slot Chips Grid */}
                    <div className="p-4 sm:p-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {day.slots.map((slot) => {
                          const isBooked = slot.status === 'BOOKED';
                          const isHeld = slot.status === 'HELD';
                          const isAvailable = slot.status === 'AVAILABLE';
                          const isDisabled = slot.status === 'DISABLED';

                          return (
                            <div
                              key={slot._id}
                              className={`p-3 rounded-xl border transition-all duration-200 flex items-center justify-between group ${
                                isBooked
                                  ? 'bg-[#1a0f38] border-amber-400/40 text-amber-200 shadow-glow'
                                  : isHeld
                                  ? 'bg-[#18112e] border-amber-500/50 text-amber-300'
                                  : isAvailable
                                  ? 'bg-[#0f0a24] border-purple-800/40 text-slate-200 hover:border-purple-600'
                                  : 'bg-[#0c081d] border-zinc-800/50 text-zinc-500'
                              }`}
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                                  <span className="font-mono text-xs font-bold tracking-wide">
                                    {slot.startTime} - {slot.endTime}
                                  </span>
                                </div>

                                <div className="text-[11px] font-mono">
                                  {isBooked ? (
                                    <span className="text-amber-300 font-semibold flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                      {slot.heldBy ? slot.heldBy.name : 'Booked'}
                                    </span>
                                  ) : isHeld ? (
                                    <span className="text-amber-400 flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                                      Held for {slot.heldBy?.name || 'Client'}
                                    </span>
                                  ) : isAvailable ? (
                                    <span className="text-emerald-400/90">● Available</span>
                                  ) : (
                                    <span className="text-zinc-500">○ Disabled</span>
                                  )}
                                </div>
                              </div>

                              {/* Slot Actions */}
                              {!isBooked && (
                                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleStatus(slot)}
                                    className="p-1 rounded-md text-slate-400 hover:text-white transition-colors"
                                    title={isDisabled ? 'Enable Slot' : 'Disable Slot'}
                                  >
                                    <Ban className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSlot(slot._id)}
                                    className="p-1 rounded-md text-slate-400 hover:text-red-400 transition-colors"
                                    title="Delete Slot"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* Table View: Exhaustive full table */
          <div className="rounded-2xl bg-[#140e30]/90 border border-purple-900/40 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-[#0e0921] text-[11px] font-mono uppercase tracking-wider text-purple-300 border-b border-purple-900/30">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Time Window</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Hold / Reservation</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-950/60 font-sans">
                  {tableSlots.map((s) => (
                    <tr key={s._id} className="hover:bg-purple-950/20 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-100 font-semibold">
                        {s.date}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-amber-300">
                        {s.startTime} - {s.endTime}
                      </td>
                      <td className="px-6 py-4">
                        <Badge status={s.status} />
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {s.heldBy ? (
                          <span className="text-purple-300 font-semibold">
                            Seeker: {s.heldBy.name} ({s.heldBy.email})
                          </span>
                        ) : (
                          'None'
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {s.status !== 'BOOKED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(s)}
                              className="text-xs text-slate-300"
                            >
                              {s.status === 'DISABLED' ? 'Enable' : 'Disable'}
                            </Button>
                          )}

                          {s.status !== 'BOOKED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSlot(s._id)}
                              className="text-red-400 hover:text-red-300"
                              title="Delete Slot"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
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

        {/* Create Slot Modal with Quick Presets */}
        <Modal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Create Consultation Slot"
        >
          <form onSubmit={handleCreateSlot} className="space-y-4">
            {createError && (
              <div className="p-3 rounded-lg bg-red-950/70 border border-red-700/50 text-xs text-red-200">
                {createError}
              </div>
            )}

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-purple-200 mb-1">
                Slot Date (YYYY-MM-DD)
              </label>
              <input
                type="date"
                value={newSlot.date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 bg-[#120c29] border border-purple-800/60 rounded-lg text-sm text-slate-100 outline-none"
              />
            </div>

            {/* Quick Time Window Presets */}
            <div>
              <span className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Quick Time Presets:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TIME_PRESETS.map((p) => {
                  const isActive =
                    newSlot.startTime === p.startTime && newSlot.endTime === p.endTime;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() =>
                        setNewSlot({
                          ...newSlot,
                          startTime: p.startTime,
                          endTime: p.endTime,
                        })
                      }
                      className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono text-center transition-all ${
                        isActive
                          ? 'bg-amber-400 text-slate-950 font-bold border-amber-300'
                          : 'bg-[#100a26] text-slate-300 border-purple-800/50 hover:border-purple-600'
                      }`}
                    >
                      <div className="font-sans font-medium text-[10px] text-purple-300">
                        {p.label}
                      </div>
                      <div>{p.startTime} - {p.endTime}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-purple-200 mb-1">
                  Start Time (HH:mm)
                </label>
                <input
                  type="time"
                  value={newSlot.startTime}
                  onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-[#120c29] border border-purple-800/60 rounded-lg text-sm text-slate-100 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-purple-200 mb-1">
                  End Time (HH:mm)
                </label>
                <input
                  type="time"
                  value={newSlot.endTime}
                  onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-[#120c29] border border-purple-800/60 rounded-lg text-sm text-slate-100 outline-none font-mono"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              The backend atomically checks availability to prevent overlapping or duplicate slots.
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-purple-900/40">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="gold"
                size="sm"
                isLoading={createLoading}
              >
                Create Slot
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  );
};
