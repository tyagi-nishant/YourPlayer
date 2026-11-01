import React, { useState } from 'react';
import { ThemeMode, PaletteTone } from '../types';
import { CheckCircle2, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface TestimonialsSectionProps {
  theme: ThemeMode;
  paletteTone: PaletteTone;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  theme,
  paletteTone,
}) => {
  const isDark = theme === 'dark';
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = [
    {
      quote:
        'Aura reconstructed our core analytical workstation from bare metal. Our portfolio managers executed $4.2B with zero display latency during the Q3 market rotation. The difference between 12 FPS and 120 FPS was night and day for our trading floor.',
      author: 'Marcus Vance',
      role: 'Chief Technology Officer',
      company: 'Meridian Global Assets (New York)',
      metric: '0.8ms Tick Stream',
      verifiedOutcome: 'Reconciliation speed dropped from 14 minutes to 8 seconds.',
    },
    {
      quote:
        'The ergonomic clarity of the fleet interface directly translated into safer street trials and faster regulatory certification in three tier-one jurisdictions. Their systems thinking eliminated 74% of false-positive alarms.',
      author: 'Dr. Elena Rostova',
      role: 'VP of Safety & Autonomy',
      company: 'Kallisto Robotics Group (Munich)',
      metric: '-68% Triage Speed',
      verifiedOutcome: 'Operator shift endurance lengthened 2.4x with zero safety incidents.',
    },
    {
      quote:
        'Aura transformed our digital presence into a working tool for the world’s top architectural firms. It is as thoughtfully crafted as our physical furniture. Spec-to-quote conversion rate surged by 142% within 90 days.',
      author: 'Frederik Lindqvist',
      role: 'Creative Director',
      company: 'Nordik Living (Copenhagen)',
      metric: '€8.4M Direct Specs',
      verifiedOutcome: 'Secured primary furnishing contracts for four European landmark towers.',
    },
    {
      quote:
        'The speed and clarity of Helix have made genomic analysis intuitive for our clinical oncology staff. It is extraordinarily rare to see bioinformatics software combine rigorous clinical safety with such refined typographic poise.',
      author: 'Dr. Sarah Jenkins, MD',
      role: 'Director of Molecular Pathology',
      company: 'St. Jude Oncology Research (Boston)',
      metric: '-52% Review Time',
      verifiedOutcome: 'Saved 3.2 days per late-stage patient biopsy turnaround.',
    },
  ];

  const current = testimonials[activeIndex];

  return (
    <section className="py-20 lg:py-28 border-t border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <div className="text-xs font-mono uppercase tracking-wider opacity-60 mb-2">
            Verified Partner Evidence
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Backed by quantifiable client outcomes.
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setActiveIndex((prev) =>
                    prev === 0 ? testimonials.length - 1 : prev - 1
                  )
                }
                className="p-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono opacity-50 px-2 tabular-nums">
                0{activeIndex + 1} / 0{testimonials.length}
              </span>
              <button
                onClick={() =>
                  setActiveIndex((prev) =>
                    prev === testimonials.length - 1 ? 0 : prev + 1
                  )
                }
                className="p-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Big Attributable Testimonial Card */}
        <div
          className={`rounded-2xl border p-8 sm:p-12 transition-all relative overflow-hidden ${
            isDark
              ? 'bg-neutral-900/90 border-neutral-800 text-neutral-100'
              : 'bg-white border-neutral-200 text-neutral-900 shadow-sm'
          }`}
        >
          <Quote className="w-12 h-12 opacity-10 absolute top-8 right-8 pointer-events-none" />

          <div className="max-w-4xl">
            <blockquote className="text-xl sm:text-2xl font-medium leading-relaxed mb-8">
              &ldquo;{current.quote}&rdquo;
            </blockquote>

            <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <div className="font-bold text-base">{current.author}</div>
                <div className="text-xs opacity-70 mt-0.5">
                  {current.role} · {current.company}
                </div>
              </div>

              {/* Verified impact box */}
              <div className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                    {current.metric}
                  </span>
                  <span className="opacity-70 text-[11px] block mt-0.5">
                    {current.verifiedOutcome}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
