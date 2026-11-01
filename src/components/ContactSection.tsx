import React, { useState } from 'react';
import { ThemeMode, PaletteTone } from '../types';
import { ArrowRight, CheckCircle2, ShieldCheck, Mail, MapPin } from 'lucide-react';

interface ContactSectionProps {
  theme: ThemeMode;
  paletteTone: PaletteTone;
  onOpenBooking: () => void;
  onShowToast: (title: string, desc?: string) => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  theme,
  paletteTone,
  onOpenBooking,
  onShowToast,
}) => {
  const isDark = theme === 'dark';

  const [directEmail, setDirectEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleQuickInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directEmail.trim() || !/^\S+@\S+\.\S+$/.test(directEmail)) {
      onShowToast('Invalid Email', 'Please provide a valid work email address.');
      return;
    }
    setIsSubscribed(true);
    onShowToast('Inquiry Initiated', 'Our engineering team will contact you within 1 business day.');
  };

  return (
    <section id="contact" className="py-20 lg:py-28 border-t border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`rounded-3xl border p-8 sm:p-14 transition-all relative overflow-hidden ${
            isDark
              ? 'bg-neutral-900/90 border-neutral-800 text-neutral-100'
              : 'bg-neutral-950 text-white border-neutral-900'
          }`}
        >
          {/* Subtle background radial aura */}
          <div
            className="absolute top-0 right-0 w-96 h-96 pointer-events-none opacity-20 blur-3xl rounded-full"
            style={{
              background:
                paletteTone === 'cobalt'
                  ? 'radial-gradient(circle, #3b82f6 0%, transparent 70%)'
                  : paletteTone === 'sandstone'
                  ? 'radial-gradient(circle, #d97706 0%, transparent 70%)'
                  : 'radial-gradient(circle, #ffffff 0%, transparent 70%)',
            }}
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Col: Prompt & Value Statement (7 cols) */}
            <div className="lg:col-span-7">
              <div className="text-xs font-mono uppercase tracking-wider opacity-60 mb-3 text-neutral-400">
                Quarterly Intake Open · Q1/Q2 Sprints
              </div>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-6 leading-tight">
                Ready to engineer your next breakthrough?
              </h2>
              <p className="text-base sm:text-lg opacity-75 max-w-xl leading-relaxed mb-8 font-normal text-neutral-300">
                We accept only three client engagements per quarter to maintain relentless focus, direct founder access, and zero delegation to junior contractors.
              </p>

              <div className="flex flex-wrap items-center gap-6 text-xs text-neutral-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Comprehensive IP Ownership</span>
                </div>
                <span aria-hidden="true">·</span>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>team@aurastudio.design</span>
                </div>
              </div>
            </div>

            {/* Right Col: Interactive Lead Capture (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 backdrop-blur-md">
                <h3 className="text-base font-bold mb-2">
                  Schedule Direct Technical Call
                </h3>
                <p className="text-xs opacity-70 mb-5">
                  Connect directly with our Principal Architect to review your product roadmap and architecture specs.
                </p>

                <button
                  onClick={onOpenBooking}
                  className={`w-full py-3.5 px-5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-sm active:scale-98 ${
                    paletteTone === 'cobalt'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : paletteTone === 'sandstone'
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-white hover:bg-neutral-200 text-neutral-900'
                  }`}
                >
                  <span>Book 30-Minute Discovery</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Or Quick Email Drop */}
              <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800">
                <div className="text-xs font-semibold mb-2">
                  Prefer a written architecture estimate?
                </div>
                {!isSubscribed ? (
                  <form onSubmit={handleQuickInquiry} className="flex gap-2">
                    <input
                      type="email"
                      value={directEmail}
                      onChange={(e) => setDirectEmail(e.target.value)}
                      placeholder="Enter work email..."
                      className="flex-1 px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 outline-none focus:border-neutral-600"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
                    >
                      Send
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Inquiry received. Expect a response in &lt; 24h.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
