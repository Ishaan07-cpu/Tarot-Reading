import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { ReadingType, Slot } from '../../types';
import { ClientLayout } from '../../components/layout/ClientLayout';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Sparkles,
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const BookReadingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedReadingId = searchParams.get('readingTypeId');

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [readingTypes, setReadingTypes] = useState<ReadingType[]>([]);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Form selections
  const [selectedReading, setSelectedReading] = useState<ReadingType | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [notes, setNotes] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  // Load reading types
  useEffect(() => {
    const initData = async () => {
      try {
        const res = await api.get('/reading-types');
        if (res.data?.success) {
          const types: ReadingType[] = res.data.data;
          setReadingTypes(types);

          if (preselectedReadingId) {
            const found = types.find((t) => t._id === preselectedReadingId);
            if (found) {
              setSelectedReading(found);
              setStep(2);
            }
          }
        }
      } catch (err) {
        console.error('Error loading reading types', err);
      } finally {
        setLoadingInitial(false);
      }
    };

    initData();
  }, [preselectedReadingId]);

  // Load available slots
  useEffect(() => {
    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const res = await api.get('/slots');
        if (res.data?.success) {
          const slots: Slot[] = res.data.data;
          setAvailableSlots(slots);

          // Select first available date by default
          if (slots.length > 0 && !selectedDate) {
            setSelectedDate(slots[0].date);
          }
        }
      } catch (err) {
        console.error('Error loading slots', err);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, []);

  // Distinct dates from available slots
  const availableDates = Array.from(new Set(availableSlots.map((s) => s.date))).sort();
  // Slots for currently selected date
  const slotsForDate = availableSlots.filter((s) => s.date === selectedDate);

  const handleReadingSelect = (rt: ReadingType) => {
    setSelectedReading(rt);
    setError('');
    setStep(2);
  };

  const handleSlotSelect = (slot: Slot) => {
    setSelectedSlot(slot);
    setError('');
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReading || !selectedSlot) {
      setError('Please select both a reading type and a slot.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.post('/bookings', {
        slotId: selectedSlot._id,
        readingTypeId: selectedReading._id,
        notes: notes.trim(),
      });

      if (res.data?.success) {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to book slot. It may have just been reserved by another seeker.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <ClientLayout>
        <div className="py-24">
          <LoadingSpinner message="Channeling available tarot readings..." />
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="max-w-4xl mx-auto">
        {/* Wizard Stepper */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800/50 text-[11px] font-mono tracking-wider text-amber-300 uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Sacred Booking Wizard</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-100">
            Book Your Tarot Consultation
          </h1>

          <div className="flex items-center justify-center max-w-md mx-auto mt-6">
            <div className="flex items-center w-full">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-serif font-bold border transition-colors ${
                  step >= 1
                    ? 'bg-amber-500 border-amber-400 text-slate-950'
                    : 'bg-[#150f33] border-purple-800 text-slate-400'
                }`}
              >
                1
              </div>
              <div
                className={`flex-1 h-0.5 mx-2 transition-colors ${
                  step >= 2 ? 'bg-amber-400' : 'bg-purple-900/60'
                }`}
              />
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-serif font-bold border transition-colors ${
                  step >= 2
                    ? 'bg-amber-500 border-amber-400 text-slate-950'
                    : 'bg-[#150f33] border-purple-800 text-slate-400'
                }`}
              >
                2
              </div>
              <div
                className={`flex-1 h-0.5 mx-2 transition-colors ${
                  step >= 3 ? 'bg-amber-400' : 'bg-purple-900/60'
                }`}
              />
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-serif font-bold border transition-colors ${
                  step === 3
                    ? 'bg-amber-500 border-amber-400 text-slate-950'
                    : 'bg-[#150f33] border-purple-800 text-slate-400'
                }`}
              >
                3
              </div>
            </div>
          </div>
          <div className="flex justify-between max-w-md mx-auto text-[11px] font-mono tracking-wider uppercase text-slate-400 mt-2 px-1">
            <span>Reading Type</span>
            <span>Date & Slot</span>
            <span>Intentions</span>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-xl bg-red-950/70 border border-red-700/50 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-200">{error}</p>
          </div>
        )}

        {/* STEP 1: Select Reading Type */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-serif font-bold text-slate-100">
                Step 1: Choose Your Reading Spread
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Select the consultation focus aligned with your questions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {readingTypes.map((rt) => (
                <div
                  key={rt._id}
                  onClick={() => handleReadingSelect(rt)}
                  className={`p-6 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                    selectedReading?._id === rt._id
                      ? 'bg-purple-950/80 border-amber-400 shadow-glow'
                      : 'bg-[#140e30]/80 border-purple-800/40 hover:border-purple-600 hover:bg-[#18113b]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-900/60 text-xs text-purple-300 font-medium">
                        {rt.duration} mins
                      </span>
                      <span className="text-xl font-serif font-bold text-amber-300">
                        ₹{rt.price}
                      </span>
                    </div>

                    <h3 className="text-lg font-serif font-bold text-slate-100 mb-2">
                      {rt.name}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                      {rt.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-purple-900/30 flex items-center justify-between text-xs font-semibold text-amber-400">
                    <span>Select Spread</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Select Date & Available Slot */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-serif font-bold text-slate-100">
                Step 2: Choose An Available Slot
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Selected spread:{' '}
                <span className="text-amber-300 font-serif font-semibold">
                  {selectedReading?.name} (₹{selectedReading?.price})
                </span>
              </p>
            </div>

            {loadingSlots ? (
              <LoadingSpinner message="Checking reader availability..." />
            ) : availableDates.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-[#140e30]/80 border border-purple-800/40">
                <Clock className="w-10 h-10 text-purple-500/50 mx-auto mb-3" />
                <h4 className="text-base font-serif font-semibold text-slate-200">
                  No slots currently open
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Our reader is updating available times. Please check back shortly or select another spread.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Date Selection Pills */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-purple-300 mb-3">
                    Available Dates
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {availableDates.map((date) => (
                      <button
                        key={date}
                        type="button"
                        onClick={() => {
                          setSelectedDate(date);
                          setSelectedSlot(null);
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                          selectedDate === date
                            ? 'bg-amber-400 text-slate-950 font-semibold shadow-glow'
                            : 'bg-[#150f33] text-slate-300 border border-purple-800/40 hover:border-purple-600'
                        }`}
                      >
                        {date}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Slot Grid for Chosen Date */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-purple-300 mb-3">
                    Time Slots on {selectedDate} (24-Hour)
                  </label>

                  {slotsForDate.length === 0 ? (
                    <p className="text-xs text-slate-400">No slots open on this date.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {slotsForDate.map((slot) => {
                        const isSelected = selectedSlot?._id === slot._id;
                        return (
                          <button
                            key={slot._id}
                            type="button"
                            onClick={() => handleSlotSelect(slot)}
                            className={`p-3.5 rounded-xl border text-center transition-all ${
                              isSelected
                                ? 'bg-purple-900 border-amber-400 text-amber-200 shadow-glow font-bold'
                                : 'bg-[#120c2b] border-purple-800/40 text-slate-200 hover:border-purple-500'
                            }`}
                          >
                            <div className="text-sm font-mono tracking-wider">
                              {slot.startTime}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              until {slot.endTime}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-purple-900/40">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Readings</span>
                  </Button>

                  <Button
                    variant="gold"
                    onClick={() => {
                      if (!selectedSlot) {
                        setError('Please select a time slot to proceed.');
                        return;
                      }
                      setStep(3);
                    }}
                    disabled={!selectedSlot}
                    className="flex items-center gap-1.5"
                  >
                    <span>Proceed to Intentions</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Notes & Confirm Submission */}
        {step === 3 && (
          <form onSubmit={handleSubmitBooking} className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-serif font-bold text-slate-100">
                Step 3: Intentions & Confirmation
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Review your session details and add any questions for the reader
              </p>
            </div>

            {/* Summary Card */}
            <div className="p-6 rounded-2xl bg-[#140e30] border border-purple-700/60 space-y-4">
              <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-purple-300">
                  Selected Reading
                </span>
                <span className="font-serif font-bold text-slate-100">
                  {selectedReading?.name}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-purple-300">
                  Date & Time
                </span>
                <span className="font-mono text-sm text-amber-300">
                  {selectedSlot?.date} ({selectedSlot?.startTime} - {selectedSlot?.endTime})
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-purple-300">
                  Session Investment
                </span>
                <span className="text-xl font-serif font-bold text-amber-400">
                  ₹{selectedReading?.price}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-purple-200 mb-1.5">
                Questions, Intentions or Focus Areas (Optional)
              </label>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Share any specific dilemmas, relationship concerns, or questions you wish to explore during your consultation..."
                className="w-full px-3.5 py-2.5 bg-[#120c29]/90 border border-purple-800/60 hover:border-purple-600 focus:border-amber-400 rounded-lg text-sm text-slate-100 placeholder-slate-500 outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Your notes are confidential and shared solely with the reader.
              </p>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-purple-900/40">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Slots</span>
              </Button>

              <Button
                type="submit"
                variant="gold"
                size="lg"
                isLoading={submitting}
                className="shadow-glow"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                <span>Confirm & Submit Booking</span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </ClientLayout>
  );
};
