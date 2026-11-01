import React, { useState } from 'react';
import { ThemeMode, PaletteTone } from '../types';
import { SERVICES } from '../data/content';
import { CheckCircle2, ChevronRight, Clock, Award, Terminal } from 'lucide-react';

interface CapabilitiesBentoProps {
  theme: ThemeMode;
  paletteTone: PaletteTone;
  onOpenBooking: () => void;
}

export const CapabilitiesBento: React.FC<CapabilitiesBentoProps> = ({
  theme,
  paletteTone,
  onOpenBooking,
}) => {
  const isDark = theme === 'dark';
  const [selectedServiceIndex, setSelectedServiceIndex] = useState<number>(0);

  const selectedService = SERVICES[selectedServiceIndex];

  return (
    <section id="capabilities" className="py-20 lg:py-28 border-t border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-14">
          <div className="text-xs font-mono uppercase tracking-wider opacity-60 mb-2">
            Engineering Disciplines
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight max-w-xl">
              Engineered for endurance, speed, and cognitive clarity.
            </h2>
            <p className="text-sm opacity-70 max-w-md">
              We operate as an integrated technical partner. Select an active discipline to inspect deliverables, sprint timelines, and verified outcomes.
            </p>
          </div>
        </div>

        {/* 2-Column Interactive Inspection Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Column 1: Numbered Service List Navigation (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            {SERVICES.map((service, idx) => {
              const isSelected = selectedServiceIndex === idx;
              return (
                <button
                  key={service.number}
                  onClick={() => setSelectedServiceIndex(idx)}
                  className={`w-full text-left p-5 rounded-xl border transition-all duration-200 flex items-start gap-4 ${
                    isSelected
                      ? isDark
                        ? 'bg-neutral-900 border-neutral-700 shadow-lg text-white'
                        : 'bg-white border-neutral-300 shadow-md text-neutral-900'
                      : isDark
                      ? 'bg-neutral-950/40 border-neutral-800/80 hover:bg-neutral-900/40 text-neutral-400'
                      : 'bg-neutral-50 border-neutral-200/80 hover:bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {/* Human Editorial Numbering (01, 02) */}
                  <span
                    className="font-mono text-sm font-bold opacity-50 shrink-0 pt-0.5"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {service.number}.
                  </span>

                  <div className="flex-1">
                    <h3 className="text-base font-bold tracking-tight mb-1">
                      {service.title}
                    </h3>
                    <p className="text-xs opacity-75 line-clamp-2 leading-relaxed">
                      {service.shortDesc}
                    </p>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform pt-0.5 ${
                      isSelected ? 'translate-x-1 opacity-100' : 'opacity-30'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Column 2: Deep Dive Service Inspector (7 cols) */}
          <div
            className={`lg:col-span-7 rounded-2xl border p-6 sm:p-8 transition-all ${
              isDark
                ? 'bg-neutral-900/90 border-neutral-800 text-neutral-100'
                : 'bg-white border-neutral-200 text-neutral-900 shadow-sm'
            }`}
          >
            {/* Header info */}
            <div className="flex items-center justify-between pb-6 border-b border-neutral-200 dark:border-neutral-800 mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">
                  {selectedService.number}
                </span>
                <span className="text-sm font-semibold uppercase tracking-wider opacity-60">
                  Detailed Discipline Specification
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-mono opacity-80">
                <Clock className="w-3.5 h-3.5" />
                <span>Sprint Cycle: {selectedService.typicalTimeline}</span>
              </div>
            </div>

            {/* Title & Description */}
            <h3 className="text-2xl font-bold tracking-tight mb-4">
              {selectedService.title}
            </h3>
            <p className="text-sm leading-relaxed opacity-80 mb-8">
              {selectedService.description}
            </p>

            {/* Core Capabilities Checklist */}
            <div className="mb-8">
              <h4 className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-4">
                What We Deliver
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedService.capabilities.map((cap, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg border border-neutral-200/60 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-950/40 flex items-start gap-2.5 text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="font-medium opacity-90">{cap}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Outcomes */}
            <div className="mb-8 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-950/60">
              <h4 className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-3 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Targeted Engineering Benchmarks</span>
              </h4>
              <ul className="space-y-1.5 text-xs">
                {selectedService.outcomes.map((outcome, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="opacity-80">{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Technology Stack Line */}
            <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono opacity-50">Stack:</span>
                {selectedService.technologies.map((t, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 opacity-80"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <button
                onClick={onOpenBooking}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 transition-opacity"
              >
                Inquire for {selectedService.title.split(' ')[0]}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
