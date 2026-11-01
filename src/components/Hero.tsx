import React, { useState } from 'react';
import { PaletteTone, ThemeMode } from '../types';
import { STUDIO_STATISTICS } from '../data/content';
import { ArrowRight, Layers, Cpu, ShieldCheck, Activity, Terminal } from 'lucide-react';

interface HeroProps {
  theme: ThemeMode;
  paletteTone: PaletteTone;
  onOpenBooking: () => void;
  onNavigateToEstimator: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  theme,
  paletteTone,
  onOpenBooking,
  onNavigateToEstimator,
}) => {
  const isDark = theme === 'dark';
  const [activeLayer, setActiveLayer] = useState<'architecture' | 'tokens' | 'telemetry'>('architecture');

  // Accent color styles based on palette
  const accentText =
    paletteTone === 'cobalt'
      ? 'text-blue-500'
      : paletteTone === 'sandstone'
      ? 'text-amber-600'
      : isDark
      ? 'text-neutral-300'
      : 'text-neutral-700';

  const accentBg =
    paletteTone === 'cobalt'
      ? 'bg-blue-600 hover:bg-blue-700 text-white'
      : paletteTone === 'sandstone'
      ? 'bg-amber-600 hover:bg-amber-700 text-white'
      : isDark
      ? 'bg-white hover:bg-neutral-200 text-neutral-900'
      : 'bg-neutral-900 hover:bg-neutral-800 text-white';

  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
      {/* Background ambient decorative grid lines (subtle & non-distracting) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Editorial Top Line Metadata (NO PILLS) */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium tracking-wider uppercase mb-6 opacity-60">
          <span>San Francisco</span>
          <span aria-hidden="true">·</span>
          <span>London</span>
          <span aria-hidden="true">·</span>
          <span>Tokyo</span>
          <span aria-hidden="true">·</span>
          <span>Digital Atelier &amp; Engineering Lab</span>
        </div>

        {/* 2-Column Split: Headline + Interactive Architectural Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-stretch mb-20">
          {/* Column 1: Value Proposition & CTAs (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] text-balance mb-6"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              We architect high-performance{' '}
              <span className={`underline decoration-1 underline-offset-8 ${accentText}`}>
                digital products
              </span>{' '}
              that scale without friction.
            </h1>

            <p className="text-base sm:text-lg leading-relaxed opacity-75 max-w-2xl mb-8 font-normal">
              Aura partners with ambitious founders and engineering leaders to design modular interface systems, sub-second web platforms, and purposeful kinetic interactions that drive measurable conversion.
            </p>

            {/* CTAs (Clean, functional, single-line) */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <button
                onClick={onOpenBooking}
                className={`px-6 py-3.5 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 shadow-sm whitespace-nowrap active:scale-98 ${accentBg}`}
              >
                <span>Schedule Discovery Session</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#play"
                className={`px-5 py-3.5 text-sm font-medium rounded-lg border transition-colors whitespace-nowrap ${
                  isDark
                    ? 'border-neutral-800 hover:bg-neutral-900 text-neutral-200'
                    : 'border-neutral-300 hover:bg-neutral-100 text-neutral-800'
                }`}
              >
                Open Play Screen
              </a>

              <button
                onClick={onNavigateToEstimator}
                className={`px-5 py-3.5 text-sm font-medium rounded-lg border transition-colors whitespace-nowrap ${
                  isDark
                    ? 'border-neutral-800 hover:bg-neutral-900 text-neutral-200'
                    : 'border-neutral-300 hover:bg-neutral-100 text-neutral-800'
                }`}
              >
                Calculate Project Estimate
              </button>
            </div>

            {/* Trust Badges / Human Proof (Clean unboxed line) */}
            <div className="pt-6 border-t border-neutral-200/80 dark:border-neutral-800/80 flex items-center gap-6 text-xs opacity-65">
              <span>Backed by 28+ Venture-Scale Founders</span>
              <span aria-hidden="true">·</span>
              <span>100% WCAG AA Certified</span>
              <span aria-hidden="true">·</span>
              <span>Zero Vendor Lock-in</span>
            </div>
          </div>

          {/* Column 2: Artisanal Interactive Architectural Terminal (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div
              className={`w-full rounded-xl border p-5 relative transition-all duration-300 ${
                isDark
                  ? 'bg-neutral-900/90 border-neutral-800 shadow-xl'
                  : 'bg-white border-neutral-200 shadow-md'
              }`}
            >
              {/* Terminal Window Header */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                  <span className="text-xs font-mono font-medium ml-2 opacity-60">
                    aura-engine // layer-inspector
                  </span>
                </div>

                {/* Layer Switcher (Functional buttons) */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveLayer('architecture')}
                    className={`px-2 py-1 text-[11px] font-mono rounded transition-colors ${
                      activeLayer === 'architecture'
                        ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold'
                        : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                    }`}
                  >
                    Arch
                  </button>
                  <button
                    onClick={() => setActiveLayer('tokens')}
                    className={`px-2 py-1 text-[11px] font-mono rounded transition-colors ${
                      activeLayer === 'tokens'
                        ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold'
                        : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                    }`}
                  >
                    Tokens
                  </button>
                  <button
                    onClick={() => setActiveLayer('telemetry')}
                    className={`px-2 py-1 text-[11px] font-mono rounded transition-colors ${
                      activeLayer === 'telemetry'
                        ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold'
                        : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                    }`}
                  >
                    Perf
                  </button>
                </div>
              </div>

              {/* Dynamic Interactive Layer Visualizer */}
              <div className="pt-4 space-y-4">
                {activeLayer === 'architecture' && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-200/60 dark:border-neutral-800/80 bg-neutral-50 dark:bg-neutral-950/50">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-emerald-500" />
                        <span className="font-semibold">Presentation Mesh</span>
                      </div>
                      <span className="text-[11px] opacity-60 tabular-nums">React 19 · RSC</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-200/60 dark:border-neutral-800/80 bg-neutral-50 dark:bg-neutral-950/50">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-blue-500" />
                        <span className="font-semibold">Off-Thread Web Worker</span>
                      </div>
                      <span className="text-[11px] opacity-60 tabular-nums">0.8ms Dispatch</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-200/60 dark:border-neutral-800/80 bg-neutral-50 dark:bg-neutral-950/50">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-amber-500" />
                        <span className="font-semibold">Accessibility Invariants</span>
                      </div>
                      <span className="text-[11px] opacity-60 tabular-nums">100% WCAG AA</span>
                    </div>

                    <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-950 font-mono text-[11px] leading-relaxed border border-neutral-200 dark:border-neutral-800">
                      <div className="text-neutral-500">Architecture Specification:</div>
                      <div className="text-emerald-600 dark:text-emerald-400 mt-1">
                        + Sub-millisecond atomic reactive state
                      </div>
                      <div className="text-blue-600 dark:text-blue-400">
                        + Zero layout shift across 1440px desktop
                      </div>
                      <div className="text-amber-600 dark:text-amber-400">
                        + Kinetic spring interpolation curves
                      </div>
                    </div>
                  </div>
                )}

                {activeLayer === 'tokens' && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 space-y-2">
                      <span className="text-neutral-500 block text-[11px]">System Spatial Scale</span>
                      <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
                        <div className="p-1 rounded bg-neutral-100 dark:bg-neutral-800">4px · Micro</div>
                        <div className="p-1 rounded bg-neutral-100 dark:bg-neutral-800">8px · Base</div>
                        <div className="p-1 rounded bg-neutral-100 dark:bg-neutral-800">16px · Card</div>
                        <div className="p-1 rounded bg-neutral-100 dark:bg-neutral-800">32px · Outer</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 space-y-2">
                      <span className="text-neutral-500 block text-[11px]">Typography Matrix</span>
                      <div className="flex items-center justify-between text-[11px]">
                        <span>Display Headline</span>
                        <span className="text-neutral-400 tabular-nums">clamp(2.25rem, 4vw, 3.75rem)</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span>Body Prose</span>
                        <span className="text-neutral-400 tabular-nums">16px / 1.625 line-height</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span>Muted Metadata</span>
                        <span className="text-neutral-400 tabular-nums">12px · tabular-nums</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
                      <span className="text-neutral-500 block text-[11px] mb-2">Contrast Budget</span>
                      <div className="flex items-center justify-between text-[11px]">
                        <span>Canvas to Surface Delta</span>
                        <span className="text-emerald-500 font-semibold tabular-nums">&le; 7% (Compliant)</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeLayer === 'telemetry' && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
                        <span className="text-[11px] opacity-60 block">Frame Rate</span>
                        <span className="text-xl font-bold tabular-nums text-emerald-500">120 FPS</span>
                        <span className="text-[10px] opacity-50 block mt-0.5">Smooth scroll locked</span>
                      </div>
                      <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
                        <span className="text-[11px] opacity-60 block">FCP Bench</span>
                        <span className="text-xl font-bold tabular-nums text-blue-500">320ms</span>
                        <span className="text-[10px] opacity-50 block mt-0.5">Hydration zero-wait</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] opacity-60">Lighthouse Performance</span>
                        <span className="font-bold text-emerald-500 tabular-nums">100 / 100</span>
                      </div>
                      <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-full rounded-full" />
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-neutral-100 dark:bg-neutral-950 text-[10px] text-neutral-500 flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Zero memory leaks detected across 24hr continuous render</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Interactive caption footer */}
              <div className="mt-4 pt-3 border-t border-neutral-200/60 dark:border-neutral-800/60 text-[11px] flex items-center justify-between opacity-50">
                <span>Interactive Architecture Sandbox</span>
                <span className="font-mono">v3.2 Spec</span>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width Proof KPI Strip (Adheres to 2-column hero balance rule) */}
        <div className="w-full border-y border-neutral-200 dark:border-neutral-800 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STUDIO_STATISTICS.map((stat, idx) => (
              <div key={idx} className="flex flex-col">
                <span
                  className="text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums mb-1"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {stat.value}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider opacity-90 mb-0.5">
                  {stat.label}
                </span>
                <span className="text-xs opacity-60 leading-tight">
                  {stat.context}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
