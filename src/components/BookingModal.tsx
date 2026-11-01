import React, { useState, useEffect } from 'react';
import { ThemeMode, PaletteTone, DiscoveryBooking } from '../types';
import { X, Calendar, Clock, CheckCircle2, Download, ArrowRight, ShieldCheck } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  paletteTone: PaletteTone;
  initialScope?: string;
  initialBudget?: string;
  onSuccess: (booking: DiscoveryBooking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  theme,
  paletteTone,
  initialScope = '',
  initialBudget = '',
  onSuccess,
}) => {
  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const [formData, setFormData] = useState<DiscoveryBooking>({
    name: '',
    email: '',
    company: '',
    projectType: 'Web Platform & Design System',
    timeline: 'Within 60 Days',
    budgetRange: initialBudget || '$35,000 – $60,000 USD',
    preferredDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    goals: initialScope || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (initialBudget) {
      setFormData((prev) => ({ ...prev, budgetRange: initialBudget }));
    }
    if (initialScope) {
      setFormData((prev) => ({
        ...prev,
        goals: prev.goals ? `${prev.goals}\n\n[Applied Estimate]: ${initialScope}` : initialScope,
      }));
    }
  }, [initialScope, initialBudget]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Please provide your full name.';
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'A valid business email address is required.';
    }
    if (!formData.company.trim()) newErrors.company = 'Please enter your organization or startup name.';
    if (!formData.goals.trim()) newErrors.goals = 'Briefly outline your core goals or system requirements.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitted(true);
    onSuccess(formData);
  };

  const handleDownloadICS = () => {
    const startDate = formData.preferredDate.replace(/-/g, '');
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Aura Digital Product Studio//Discovery Session//EN
BEGIN:VEVENT
SUMMARY:Aura Studio & ${formData.company} Discovery Session
DESCRIPTION:Technical exploration and scope alignment with ${formData.name} (${formData.email})
DTSTART:${startDate}T150000Z
DTEND:${startDate}T154500Z
LOCATION:Google Meet (Link will be emailed)
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Aura-Discovery-${formData.company || 'Session'}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border p-6 sm:p-8 shadow-2xl transition-all ${
          isDark
            ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
            : 'bg-white border-neutral-200 text-neutral-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className={`absolute top-6 right-6 p-2 rounded-full border transition-colors ${
            isDark
              ? 'border-neutral-800 hover:bg-neutral-800 text-neutral-400'
              : 'border-neutral-200 hover:bg-neutral-100 text-neutral-600'
          }`}
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSubmitted ? (
          <div>
            <div className="text-xs font-mono uppercase tracking-wider opacity-60 mb-2">
              Discovery &amp; Feasibility Call
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              Let&rsquo;s architect something great.
            </h2>
            <p className="text-sm opacity-75 mb-6">
              A 30-minute high-bandwidth session with our Principal Architect to evaluate technical feasibility, timeline, and deliverables.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 opacity-80">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Elena Rostova"
                    className={`w-full px-3.5 py-2 text-xs rounded-lg border outline-none transition-colors ${
                      errors.name ? 'border-rose-500 ring-1 ring-rose-500' : ''
                    } ${
                      isDark
                        ? 'bg-neutral-950 border-neutral-800 focus:border-neutral-600'
                        : 'bg-neutral-50 border-neutral-300 focus:border-neutral-400'
                    }`}
                  />
                  {errors.name && (
                    <span className="text-[11px] text-rose-500 mt-1 block">
                      {errors.name}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 opacity-80">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@company.com"
                    className={`w-full px-3.5 py-2 text-xs rounded-lg border outline-none transition-colors ${
                      errors.email ? 'border-rose-500 ring-1 ring-rose-500' : ''
                    } ${
                      isDark
                        ? 'bg-neutral-950 border-neutral-800 focus:border-neutral-600'
                        : 'bg-neutral-50 border-neutral-300 focus:border-neutral-400'
                    }`}
                  />
                  {errors.email && (
                    <span className="text-[11px] text-rose-500 mt-1 block">
                      {errors.email}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 opacity-80">
                    Company / Organization *
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Acme Health or Stealth AI"
                    className={`w-full px-3.5 py-2 text-xs rounded-lg border outline-none transition-colors ${
                      errors.company ? 'border-rose-500 ring-1 ring-rose-500' : ''
                    } ${
                      isDark
                        ? 'bg-neutral-950 border-neutral-800 focus:border-neutral-600'
                        : 'bg-neutral-50 border-neutral-300 focus:border-neutral-400'
                    }`}
                  />
                  {errors.company && (
                    <span className="text-[11px] text-rose-500 mt-1 block">
                      {errors.company}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 opacity-80">
                    Target Budget Range
                  </label>
                  <input
                    type="text"
                    value={formData.budgetRange}
                    onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                    placeholder="$30,000 - $60,000 USD"
                    className={`w-full px-3.5 py-2 text-xs rounded-lg border outline-none transition-colors ${
                      isDark
                        ? 'bg-neutral-950 border-neutral-800 focus:border-neutral-600'
                        : 'bg-neutral-50 border-neutral-300 focus:border-neutral-400'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 opacity-80">
                    Project Type
                  </label>
                  <select
                    value={formData.projectType}
                    onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                    className={`w-full px-3.5 py-2 text-xs rounded-lg border outline-none transition-colors ${
                      isDark
                        ? 'bg-neutral-950 border-neutral-800 focus:border-neutral-600'
                        : 'bg-neutral-50 border-neutral-300 focus:border-neutral-400'
                    }`}
                  >
                    <option>Web Platform &amp; Design System</option>
                    <option>Sub-Second High-Performance App</option>
                    <option>Kinetic 3D / WebGL Experience</option>
                    <option>Full-Stack Production MVP (0 to 1)</option>
                    <option>Enterprise Accessibility Redesign</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 opacity-80">
                    Preferred Discovery Date
                  </label>
                  <input
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    className={`w-full px-3.5 py-2 text-xs rounded-lg border outline-none transition-colors ${
                      isDark
                        ? 'bg-neutral-950 border-neutral-800 focus:border-neutral-600'
                        : 'bg-neutral-50 border-neutral-300 focus:border-neutral-400'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 opacity-80">
                  Project Context &amp; Requirements *
                </label>
                <textarea
                  rows={4}
                  value={formData.goals}
                  onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                  placeholder="Tell us what you're building, primary challenges, or specific technical benchmarks..."
                  className={`w-full px-3.5 py-2 text-xs rounded-lg border outline-none transition-colors ${
                    errors.goals ? 'border-rose-500 ring-1 ring-rose-500' : ''
                  } ${
                    isDark
                      ? 'bg-neutral-950 border-neutral-800 focus:border-neutral-600'
                      : 'bg-neutral-50 border-neutral-300 focus:border-neutral-400'
                  }`}
                />
                {errors.goals && (
                  <span className="text-[11px] text-rose-500 mt-1 block">
                    {errors.goals}
                  </span>
                )}
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800 flex-wrap gap-4">
                <div className="flex items-center gap-2 text-[11px] opacity-60">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Strict mutual NDA protects all details.</span>
                </div>

                <button
                  type="submit"
                  className={`px-6 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 shadow-sm ${
                    paletteTone === 'cobalt'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : paletteTone === 'sandstone'
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : isDark
                      ? 'bg-white hover:bg-neutral-200 text-neutral-900'
                      : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                  }`}
                >
                  <span>Confirm Discovery Booking</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="py-6 text-center space-y-6">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-2">
                Discovery Session Confirmed
              </h2>
              <p className="text-sm opacity-75 max-w-md mx-auto">
                Thank you, {formData.name}. We have reserved a preliminary review slot for{' '}
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {formData.preferredDate}
                </span>{' '}
                with our Principal Engineering lead.
              </p>
            </div>

            {/* Slip summary */}
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-left text-xs font-mono space-y-1.5 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="opacity-50">PARTNER:</span>
                <span className="font-semibold">{formData.company}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-50">CONTACT:</span>
                <span>{formData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-50">DISCIPLINE:</span>
                <span>{formData.projectType}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-50">TARGET BUDGET:</span>
                <span>{formData.budgetRange}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handleDownloadICS}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Add to Calendar (.ics)</span>
              </button>

              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
