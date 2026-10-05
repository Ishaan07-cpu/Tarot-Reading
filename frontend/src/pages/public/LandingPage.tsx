import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ReadingType } from '../../types';
import { Navbar } from '../../components/layout/Navbar';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Sparkles,
  Compass,
  Moon,
  Sun,
  Shield,
  Clock,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  Star,
  CheckCircle,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [readingTypes, setReadingTypes] = useState<ReadingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await api.get('/reading-types');
        if (res.data?.success) {
          setReadingTypes(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load reading types', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTypes();
  }, []);

  const handleSelectReading = (readingTypeId: string) => {
    if (isAuthenticated) {
      navigate(`/book?readingTypeId=${readingTypeId}`);
    } else {
      navigate(`/login?redirect=/book?readingTypeId=${readingTypeId}`);
    }
  };

  const faqs = [
    {
      q: 'How does tarot booking work on this sanctuary?',
      a: 'Select your preferred reading type, choose an available date and 24-hour time slot from our live calendar, and submit your request. Our head reader reviews your requested session, and upon approval you receive a confirmation email and live dashboard status update.',
    },
    {
      q: 'Can two seekers book the same slot at the same time?',
      a: 'Never. Our system implements database-level atomic locking and state machine guarantees. Once you book a slot, it is reserved exclusively for your session request.',
    },
    {
      q: 'What should I prepare prior to my reading?',
      a: 'Find a calm, tranquil environment. You may reflect upon particular areas of life—relationships, career, spiritual growth—or come with an open heart to let the cards reveal what needs illuminating.',
    },
    {
      q: 'Can I cancel or reschedule if my schedule shifts?',
      a: 'Yes, you can easily cancel pending and confirmed bookings directly from your client dashboard before the session deadline.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0b0819] text-slate-100 flex flex-col selection:bg-purple-900 selection:text-amber-300">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden mystic-gradient-bg border-b border-purple-900/30">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-purple-600/20 blur-[130px] rounded-full" />
          <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-amber-500/10 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/80 border border-purple-700/50 text-xs font-mono tracking-wider text-amber-300 uppercase mb-8 shadow-glow-purple">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Divine Intuitive Tarot Sanctuary</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-black tracking-tight text-slate-100 mb-6 leading-tight">
            Discover What The <br />
            <span className="gold-shimmer">Cards Have To Say</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed mb-10 font-sans">
            Unveil clarity, direction, and cosmic wisdom for love, career, and spiritual evolution.
            Reserve your private live session with our intuitive reader.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="gold"
              size="lg"
              onClick={() => {
                if (isAuthenticated) navigate('/book');
                else navigate('/login?redirect=/book');
              }}
              className="w-full sm:w-auto text-base px-8 py-4 shadow-glow"
            >
              <span>Book Your Sacred Reading</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <a href="#readings" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto text-base px-8 py-4">
                Explore Reading Types
              </Button>
            </a>
          </div>

          {/* Social Proof badges */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 border-t border-purple-900/40 text-left">
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-900/30">
              <div className="text-2xl font-serif font-bold text-amber-300">100%</div>
              <div className="text-xs text-slate-400 mt-1">Live Intuitive Readings</div>
            </div>
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-900/30">
              <div className="text-2xl font-serif font-bold text-purple-300">24/7</div>
              <div className="text-xs text-slate-400 mt-1">Real-time Slot Booking</div>
            </div>
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-900/30">
              <div className="text-2xl font-serif font-bold text-amber-300">Zero</div>
              <div className="text-xs text-slate-400 mt-1">Double Booking Guarantee</div>
            </div>
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-900/30">
              <div className="text-2xl font-serif font-bold text-purple-300">5.0 ★</div>
              <div className="text-xs text-slate-400 mt-1">Seeker Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Reading Types Section */}
      <section id="readings" className="py-24 bg-[#0a0717] border-b border-purple-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-3">
              ✦ Sacred Spreads & Consultations ✦
            </h2>
            <h3 className="text-3xl sm:text-4xl font-serif font-bold text-slate-100">
              Choose The Reading Aligned With Your Questions
            </h3>
            <p className="mt-4 text-slate-400 text-sm sm:text-base">
              Each session is personally channeled by our experienced tarot reader to provide actionable insights.
            </p>
          </div>

          {loading ? (
            <LoadingSpinner message="Channeling reading spreads..." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {readingTypes.map((rt) => (
                <div
                  key={rt._id}
                  className="group relative rounded-2xl bg-gradient-to-b from-[#161033] to-[#0f0a24] border border-purple-800/40 p-7 hover:border-amber-400/60 transition-all duration-300 hover:shadow-card-hover flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950 text-xs font-medium text-purple-300 border border-purple-700/50">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        {rt.duration} mins
                      </span>
                      <span className="text-2xl font-serif font-bold text-amber-300">
                        ₹{rt.price}
                      </span>
                    </div>

                    <h4 className="text-xl font-serif font-bold text-slate-100 group-hover:text-amber-200 transition-colors mb-3">
                      {rt.name}
                    </h4>

                    <p className="text-slate-300 text-sm leading-relaxed mb-6">
                      {rt.description}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-purple-900 group-hover:text-amber-200 group-hover:border-purple-600 transition-all"
                    onClick={() => handleSelectReading(rt._id)}
                  >
                    <span>Select & Choose Slot</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-[#0d0921] border-b border-purple-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-purple-400 mb-3">
              ✦ The Sacred Journey ✦
            </h2>
            <h3 className="text-3xl sm:text-4xl font-serif font-bold text-slate-100">
              How Your Tarot Session Works
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="p-8 rounded-2xl bg-[#140e30]/80 border border-purple-800/40 relative">
              <div className="w-12 h-12 rounded-xl bg-purple-900/60 border border-purple-500/50 flex items-center justify-center font-serif text-xl font-bold text-amber-300 mb-6">
                1
              </div>
              <h4 className="text-lg font-serif font-bold text-slate-100 mb-3">
                Choose Reading & Available Slot
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Browse our reading types and pick a live scheduled slot that fits your day from the real-time calendar.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#140e30]/80 border border-purple-800/40 relative">
              <div className="w-12 h-12 rounded-xl bg-purple-900/60 border border-purple-500/50 flex items-center justify-center font-serif text-xl font-bold text-amber-300 mb-6">
                2
              </div>
              <h4 className="text-lg font-serif font-bold text-slate-100 mb-3">
                Reader Review & Approval
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Your request is instantly transmitted to our reader. You receive live dashboard status updates and approval emails.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#140e30]/80 border border-purple-800/40 relative">
              <div className="w-12 h-12 rounded-xl bg-purple-900/60 border border-purple-500/50 flex items-center justify-center font-serif text-xl font-bold text-amber-300 mb-6">
                3
              </div>
              <h4 className="text-lg font-serif font-bold text-slate-100 mb-3">
                Receive Deep Clarity
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Step into your reading, receive personal guidance, and walk away with enlightened purpose.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sacred Benefits Section */}
      <section id="benefits" className="py-24 bg-[#0a0717] border-b border-purple-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-3">
                ✦ Why Mystic Tarot ✦
              </h2>
              <h3 className="text-3xl sm:text-4xl font-serif font-bold text-slate-100 mb-6">
                Authentic Divination Rooted In Integrity & Wisdom
              </h3>
              <p className="text-slate-300 leading-relaxed text-sm sm:text-base mb-8">
                Unlike automated computer spreads, every reading on Mystic Tarot is individually channeled by a dedicated intuitive reader honoring the ancient traditions of the Rider-Waite and sacred esoteric tarot.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-serif font-semibold text-slate-200">
                      Authoritative Booking Reliability
                    </h5>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Guaranteed slot availability with real-time state synchronization.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-serif font-semibold text-slate-200">
                      Personalized Life Guidance
                    </h5>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Tailored to your specific dilemmas, love questions, and soul path.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-serif font-semibold text-slate-200">
                      Private & Confidential
                    </h5>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Your intentions and consultations remain strictly private between you and the reader.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-gradient-to-tr from-[#1b123d] to-[#120b29] border border-purple-700/50 shadow-2xl relative overflow-hidden">
              <div className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-amber-400" />
                </div>
                <h4 className="text-2xl font-serif font-bold text-amber-200 mb-2">
                  Ready to Unveil Your Path?
                </h4>
                <p className="text-sm text-slate-300 mb-6">
                  Step through the doorway. Available reading slots are open for this week.
                </p>
                <Button
                  variant="gold"
                  className="w-full"
                  onClick={() => {
                    if (isAuthenticated) navigate('/book');
                    else navigate('/login?redirect=/book');
                  }}
                >
                  Book Your Session Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-[#0d0921]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-3">
              ✦ Answers & Wisdom ✦
            </h2>
            <h3 className="text-3xl font-serif font-bold text-slate-100">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-[#140e30]/90 border border-purple-900/50 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between text-slate-100 font-serif font-medium text-base hover:text-amber-200 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-purple-400 transition-transform duration-200 ${
                      openFaq === idx ? 'rotate-180 text-amber-400' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-sm text-slate-300 leading-relaxed border-t border-purple-950/80 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-900/40 bg-[#070512] py-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-purple-900/60 border border-purple-500/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <span className="font-serif font-bold text-slate-200 text-sm tracking-wider">
              MYSTIC TAROT SANCTUARY
            </span>
          </div>

          <p>© {new Date().getFullYear()} Mystic Tarot Sanctuary. All cosmic rights reserved.</p>

          <div className="flex space-x-6 text-slate-400">
            <a href="#readings" className="hover:text-amber-300">Readings</a>
            <a href="#how-it-works" className="hover:text-amber-300">Workflow</a>
            <a href="#faq" className="hover:text-amber-300">FAQ</a>
            <Link to="/login" className="hover:text-amber-300">Reader Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
