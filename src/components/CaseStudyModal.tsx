import React, { useState } from 'react';
import { ProjectCaseStudy, ThemeMode, PaletteTone } from '../types';
import { X, CheckCircle2, ArrowRight, TrendingUp, Compass, Navigation, Activity, ExternalLink } from 'lucide-react';

interface CaseStudyModalProps {
  project: ProjectCaseStudy | null;
  onClose: () => void;
  theme: ThemeMode;
  paletteTone: PaletteTone;
  onInquire: (projectName: string) => void;
}

export const CaseStudyModal: React.FC<CaseStudyModalProps> = ({
  project,
  onClose,
  theme,
  paletteTone,
  onInquire,
}) => {
  if (!project) return null;

  const isDark = theme === 'dark';
  const [comparisonTab, setComparisonTab] = useState<'after' | 'before'>('after');

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Fintech':
        return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case 'Mobility':
        return <Navigation className="w-4 h-4 text-blue-500" />;
      case 'Spatial':
        return <Compass className="w-4 h-4 text-amber-500" />;
      default:
        return <Activity className="w-4 h-4 text-violet-500" />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border p-6 sm:p-8 shadow-2xl transition-all ${
          isDark
            ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
            : 'bg-white border-neutral-200 text-neutral-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
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

        {/* Unboxed Metadata (NO PILLS) */}
        <div className="flex items-center gap-2 text-xs font-mono opacity-60 mb-3">
          <div className="flex items-center gap-1.5 font-sans font-semibold text-neutral-900 dark:text-neutral-100">
            {getCategoryIcon(project.category)}
            <span>{project.category}</span>
          </div>
          <span aria-hidden="true">·</span>
          <span>Client: {project.client}</span>
          <span aria-hidden="true">·</span>
          <span>Completed {project.year}</span>
        </div>

        {/* Project Title */}
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4 pr-12">
          {project.title}
        </h2>

        {/* Summary */}
        <p className="text-base sm:text-lg leading-relaxed opacity-80 mb-8 font-normal">
          {project.summary}
        </p>

        {/* Quantified Metrics Trio */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60 mb-8">
          {project.metrics.map((metric, idx) => (
            <div key={idx} className="flex flex-col">
              <span
                className="text-2xl sm:text-3xl font-bold tabular-nums text-neutral-900 dark:text-neutral-100"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {metric.value}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider opacity-90 mt-1">
                {metric.label}
              </span>
              <span className="text-xs opacity-60 mt-0.5">{metric.context}</span>
            </div>
          ))}
        </div>

        {/* Interactive Before vs After Performance Comparison (User friendly audit) */}
        {project.beforeAfterComparison && (
          <div className="mb-8 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-950/40">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider">
                  Quantitative Impact Benchmark
                </h4>
                <p className="text-xs opacity-60">
                  {project.beforeAfterComparison.description}
                </p>
              </div>

              {/* Toggle controls */}
              <div className="flex items-center p-1 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-xs font-medium">
                <button
                  onClick={() => setComparisonTab('before')}
                  className={`px-3 py-1 rounded transition-colors ${
                    comparisonTab === 'before'
                      ? 'bg-white dark:bg-neutral-900 shadow-sm font-semibold'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  Baseline Prior
                </button>
                <button
                  onClick={() => setComparisonTab('after')}
                  className={`px-3 py-1 rounded transition-colors ${
                    comparisonTab === 'after'
                      ? 'bg-white dark:bg-neutral-900 shadow-sm font-semibold text-emerald-600 dark:text-emerald-400'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  Aura Architecture
                </button>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 transition-all">
              {comparisonTab === 'before' ? (
                <div>
                  <span className="text-xs font-mono text-neutral-400 block mb-1">
                    [Previous Status Quo]
                  </span>
                  <div className="text-base font-semibold text-neutral-700 dark:text-neutral-300">
                    {project.beforeAfterComparison.beforeMetric}
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">
                    Legacy implementation faced memory bloat, high frame dropping, and complex user friction.
                  </p>
                </div>
              ) : (
                <div>
                  <span className="text-xs font-mono text-emerald-500 font-semibold block mb-1">
                    [Aura Production Delivery]
                  </span>
                  <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                    {project.beforeAfterComparison.afterMetric}
                  </div>
                  <p className="text-xs opacity-75 mt-2">
                    Engineered with zero UI thread contention, instant sub-second queries, and automated failover.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Narrative Deep Dive: Challenge & Solution */}
        <div className="space-y-6 mb-8 text-sm leading-relaxed">
          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider text-xs mb-2">
              The Engineering Challenge
            </h4>
            <p className="opacity-75">{project.challenge}</p>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider text-xs mb-2">
              Architectural Solution
            </h4>
            <p className="opacity-75">{project.solution}</p>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider text-xs mb-2">
              Long-term Business Outcome
            </h4>
            <p className="opacity-75">{project.outcome}</p>
          </div>
        </div>

        {/* Attributable Testimonial Block */}
        <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/80 mb-8">
          <blockquote className="text-sm italic opacity-90 leading-relaxed mb-4">
            &ldquo;{project.testimonial.quote}&rdquo;
          </blockquote>
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold block">{project.testimonial.author}</span>
              <span className="opacity-60">{project.testimonial.role} · {project.testimonial.company}</span>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          </div>
        </div>

        {/* Technologies Grid */}
        <div className="mb-8">
          <h4 className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-3">
            Core Technology Stack
          </h4>
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            {project.technologies.map((tech, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Action */}
        <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between flex-wrap gap-4">
          <button
            onClick={onClose}
            className="text-xs font-medium opacity-60 hover:opacity-100"
          >
            &larr; Back to all case studies
          </button>

          <button
            onClick={() => {
              onClose();
              onInquire(project.title);
            }}
            className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 flex items-center gap-1.5 transition-all shadow-sm"
          >
            <span>Request Work Like This</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
