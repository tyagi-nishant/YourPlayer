import React, { useState, useId } from 'react';
import { ThemeMode, PaletteTone, ProjectEstimateConfig } from '../types';
import { Calculator, Check, Copy, ArrowRight, Clock, Users, Shield } from 'lucide-react';

interface InteractiveEstimatorProps {
  theme: ThemeMode;
  paletteTone: PaletteTone;
  onApplyToBooking: (summary: string, budgetRange: string) => void;
  onShowToast: (title: string, desc?: string) => void;
}

export const InteractiveEstimator: React.FC<InteractiveEstimatorProps> = ({
  theme,
  paletteTone,
  onApplyToBooking,
  onShowToast,
}) => {
  const isDark = theme === 'dark';
  const archetypeSelectId = useId();

  const [archetype, setArchetype] = useState<'saas' | 'web-platform' | 'design-system' | 'mobile-mvp'>('web-platform');
  const [complexity, setComplexity] = useState<'standard' | 'advanced' | 'enterprise'>('advanced');
  const [timelineSpeed, setTimelineSpeed] = useState<'standard' | 'expedited' | 'flexible'>('standard');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([
    'design-tokens',
    'realtime-telemetry'
  ]);

  const addonDefinitions = [
    {
      id: 'design-tokens',
      label: 'Multi-Brand Design Tokens & Figma Sync',
      price: 6000,
      weeks: 1,
      desc: 'Tokenized CSS variables, typography scales, light/dark themes'
    },
    {
      id: 'realtime-telemetry',
      label: 'Sub-Millisecond Real-Time WebSockets',
      price: 8500,
      weeks: 2,
      desc: 'Live streaming telemetry, off-thread Web Workers, zero frame-drop'
    },
    {
      id: 'webgl-canvas',
      label: 'Kinetic 3D / WebGL Shader Viewport',
      price: 11000,
      weeks: 2.5,
      desc: 'Three.js interactive scene, lighting models, reduced-motion fallback'
    },
    {
      id: 'wcag-aaa',
      label: 'WCAG AAA Accessibility & Screen Reader Audit',
      price: 5500,
      weeks: 1,
      desc: 'Rigorous keyboard navigation, aria live regions, contrast verification'
    },
    {
      id: 'pwa-offline',
      label: 'Offline-First PWA & IndexedDB Caching',
      price: 7000,
      weeks: 1.5,
      desc: 'Service worker cache rules, offline fallback UI, instant resume'
    }
  ];

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Base calculation logic
  const calculateEstimate = () => {
    let baseMin = 24000;
    let baseMax = 36000;
    let baseWeeks = 6;

    if (archetype === 'saas') {
      baseMin = 32000;
      baseMax = 48000;
      baseWeeks = 8;
    } else if (archetype === 'design-system') {
      baseMin = 20000;
      baseMax = 30000;
      baseWeeks = 5;
    } else if (archetype === 'mobile-mvp') {
      baseMin = 28000;
      baseMax = 42000;
      baseWeeks = 7;
    }

    // Complexity multipliers
    if (complexity === 'advanced') {
      baseMin *= 1.35;
      baseMax *= 1.35;
      baseWeeks += 2;
    } else if (complexity === 'enterprise') {
      baseMin *= 1.8;
      baseMax *= 1.8;
      baseWeeks += 4;
    }

    // Timeline speed
    if (timelineSpeed === 'expedited') {
      baseMin *= 1.25;
      baseMax *= 1.25;
      baseWeeks = Math.max(4, Math.round(baseWeeks * 0.75));
    } else if (timelineSpeed === 'flexible') {
      baseMin *= 0.95;
      baseMax *= 0.95;
      baseWeeks += 2;
    }

    // Addons
    const addonsCost = selectedAddons.reduce((acc, currentId) => {
      const match = addonDefinitions.find((a) => a.id === currentId);
      return acc + (match ? match.price : 0);
    }, 0);

    const minTotal = Math.round((baseMin + addonsCost) / 1000) * 1000;
    const maxTotal = Math.round((baseMax + addonsCost * 1.2) / 1000) * 1000;

    return {
      min: minTotal,
      max: maxTotal,
      weeks: Math.round(baseWeeks),
    };
  };

  const estimate = calculateEstimate();

  const handleCopySummary = () => {
    const summaryText = `Aura Studio Project Scope Estimate:
- Archetype: ${archetype}
- Complexity: ${complexity}
- Cadence: ${timelineSpeed}
- Active Add-ons: ${selectedAddons.join(', ')}
- Estimated Investment: $${estimate.min.toLocaleString()} - $${estimate.max.toLocaleString()} USD
- Estimated Duration: ~${estimate.weeks} Weeks`;

    navigator.clipboard.writeText(summaryText);
    onShowToast('Estimate Copied to Clipboard', 'You can paste this in your proposal or email.');
  };

  const handleApply = () => {
    const budgetStr = `$${estimate.min.toLocaleString()} - $${estimate.max.toLocaleString()}`;
    const scopeStr = `${archetype.toUpperCase()} (${complexity}) · ~${estimate.weeks} Weeks Delivery · Addons: ${selectedAddons.length} selected`;
    onApplyToBooking(scopeStr, budgetStr);
    onShowToast('Scope Applied to Inquiry', 'Your estimated scope has been pre-filled in the Discovery booking form.');
  };

  return (
    <section id="estimator" className="py-20 lg:py-28 border-t border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-14">
          <div className="text-xs font-mono uppercase tracking-wider opacity-60 mb-2">
            Scope &amp; Investment Transparency
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight max-w-xl">
              Calculate your project scope in real time.
            </h2>
            <p className="text-sm opacity-70 max-w-md">
              No opaque agency markups. Configure your core platform archetype, required velocity, and modular engineering add-ons below for immediate clarity.
            </p>
          </div>
        </div>

        {/* 2-Column Split: Estimator Controls (7 cols) + Real-time Outcome Card (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-7 space-y-8">
            {/* Step 1: Platform Archetype */}
            <div>
              <label
                htmlFor={archetypeSelectId}
                className="text-xs font-semibold uppercase tracking-wider opacity-60 block mb-3"
              >
                1. Select Core Platform Archetype
              </label>
              <div
                id={archetypeSelectId}
                role="group"
                aria-label="Core Platform Archetype"
                className="grid grid-cols-2 gap-3"
              >
                {[
                  { id: 'web-platform', label: 'Web Platform / Portal', sub: 'Sub-second responsive app' },
                  { id: 'saas', label: 'Enterprise SaaS Hub', sub: 'Multi-tenant, dashboard & billing' },
                  { id: 'design-system', label: 'Design System & Tokens', sub: 'Figma sync, tokens, docs' },
                  { id: 'mobile-mvp', label: 'Full-Stack MVP Launchpad', sub: 'Production 0 to 1 release' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setArchetype(item.id as any)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      archetype === item.id
                        ? isDark
                          ? 'bg-neutral-900 border-neutral-600 text-white shadow-md ring-1 ring-neutral-500'
                          : 'bg-white border-neutral-900 text-neutral-900 shadow-md ring-1 ring-neutral-900'
                        : isDark
                        ? 'bg-neutral-950/60 border-neutral-800 hover:bg-neutral-900/50 text-neutral-400'
                        : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    <span className="font-bold text-sm block">{item.label}</span>
                    <span className="text-xs opacity-70 block mt-1">{item.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: System Complexity */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider opacity-60 block mb-3">
                2. System Complexity &amp; Architecture Depth
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'standard', label: 'Standard', desc: 'Core workflows & responsive layouts' },
                  { id: 'advanced', label: 'Advanced', desc: 'Real-time sync, permissions, APIs' },
                  { id: 'enterprise', label: 'Enterprise', desc: 'Global scale, high availability, audits' },
                ].map((comp) => (
                  <button
                    key={comp.id}
                    onClick={() => setComplexity(comp.id as any)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      complexity === comp.id
                        ? isDark
                          ? 'bg-neutral-900 border-neutral-600 text-white ring-1 ring-neutral-500'
                          : 'bg-white border-neutral-900 text-neutral-900 ring-1 ring-neutral-900 shadow-sm'
                        : isDark
                        ? 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:bg-neutral-900/40'
                        : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    <span className="font-bold text-xs block">{comp.label}</span>
                    <span className="text-[11px] opacity-70 block mt-1">{comp.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Sprint Cadence */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider opacity-60 block mb-3">
                3. Desired Sprint Velocity
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'flexible', label: 'Flexible Pace', tag: 'Standard discovery buffer' },
                  { id: 'standard', label: 'Standard Cadence', tag: 'Balanced 2-week cycles' },
                  { id: 'expedited', label: 'Accelerated Sprint', tag: 'Dedicated rapid team pod' },
                ].map((speed) => (
                  <button
                    key={speed.id}
                    onClick={() => setTimelineSpeed(speed.id as any)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      timelineSpeed === speed.id
                        ? isDark
                          ? 'bg-neutral-900 border-neutral-600 text-white ring-1 ring-neutral-500'
                          : 'bg-white border-neutral-900 text-neutral-900 ring-1 ring-neutral-900 shadow-sm'
                        : isDark
                        ? 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:bg-neutral-900/40'
                        : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    <span className="font-bold text-xs block">{speed.label}</span>
                    <span className="text-[11px] opacity-70 block mt-1">{speed.tag}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Modular Engineering Add-ons */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider opacity-60 block mb-3">
                4. Selectable Engineering Modules (Toggle on/off)
              </label>
              <div className="space-y-2.5">
                {addonDefinitions.map((addon) => {
                  const isChecked = selectedAddons.includes(addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-4 ${
                        isChecked
                          ? isDark
                            ? 'bg-neutral-900/90 border-neutral-700 text-white'
                            : 'bg-white border-neutral-300 text-neutral-900 shadow-xs'
                          : isDark
                          ? 'bg-neutral-950/40 border-neutral-800/80 text-neutral-400 hover:bg-neutral-900/30'
                          : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition-colors ${
                            isChecked
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-neutral-400 dark:border-neutral-600'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <span className="text-xs font-semibold block">{addon.label}</span>
                          <span className="text-[11px] opacity-65 block mt-0.5">{addon.desc}</span>
                        </div>
                      </div>

                      <span className="text-xs font-mono tabular-nums font-semibold shrink-0">
                        +${addon.price.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Real-time Summary Card (Sticky on desktop) */}
          <div className="lg:col-span-5 sticky top-24">
            <div
              className={`rounded-2xl border p-6 sm:p-8 transition-all shadow-xl ${
                isDark
                  ? 'bg-neutral-900/95 border-neutral-800 text-neutral-100'
                  : 'bg-white border-neutral-200 text-neutral-900'
              }`}
            >
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800 mb-6">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-mono uppercase tracking-wider font-semibold">
                    Live Investment Estimate
                  </span>
                </div>
                <span className="text-xs font-mono opacity-50">USD Range</span>
              </div>

              {/* Price display with Tabular numerals */}
              <div className="mb-6">
                <div className="text-xs font-mono opacity-60 uppercase mb-1">
                  Estimated Capital Commitment
                </div>
                <div
                  className="text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums text-neutral-900 dark:text-neutral-100"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  ${estimate.min.toLocaleString()} – ${estimate.max.toLocaleString()}
                </div>
                <div className="text-xs opacity-60 mt-1">
                  Includes fixed-scope milestones, source ownership, &amp; zero licensing fees.
                </div>
              </div>

              {/* Delivery timeline & Team pod */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 mb-6 text-xs">
                <div>
                  <div className="flex items-center gap-1.5 opacity-60 mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Estimated Duration</span>
                  </div>
                  <div className="text-lg font-bold font-mono tabular-nums">
                    ~{estimate.weeks} Weeks
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 opacity-60 mb-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>Assigned Pod</span>
                  </div>
                  <div className="font-semibold">
                    3 Specialists (Architect + UI + QA)
                  </div>
                </div>
              </div>

              {/* Milestone breakdown progress bar */}
              <div className="space-y-2 mb-8">
                <div className="flex justify-between text-xs font-mono opacity-60">
                  <span>Sprint Milestones</span>
                  <span>100% Phase Split</span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 flex overflow-hidden">
                  <div className="bg-emerald-500 w-[20%]" title="Discovery & System Tokens (20%)" />
                  <div className="bg-blue-500 w-[45%]" title="Architecture & Core Features (45%)" />
                  <div className="bg-purple-500 w-[20%]" title="Refinement & Accessibility (20%)" />
                  <div className="bg-amber-500 w-[15%]" title="Production Hardening & Handover (15%)" />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono opacity-50 pt-1">
                  <span>Tokens (20%)</span>
                  <span>Core (45%)</span>
                  <span>Audit (20%)</span>
                  <span>Launch (15%)</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleApply}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-sm active:scale-98 ${
                    paletteTone === 'cobalt'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : paletteTone === 'sandstone'
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : isDark
                      ? 'bg-neutral-100 hover:bg-white text-neutral-900'
                      : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                  }`}
                >
                  <span>Apply Estimate to Discovery Call</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleCopySummary}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-medium border transition-colors flex items-center justify-center gap-2 ${
                    isDark
                      ? 'border-neutral-800 hover:bg-neutral-800 text-neutral-300'
                      : 'border-neutral-200 hover:bg-neutral-100 text-neutral-700'
                  }`}
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Scope Summary</span>
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-neutral-200/60 dark:border-neutral-800/60 flex items-center gap-2 text-[11px] opacity-50">
                <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>NDA &amp; Intellectual Property Assignment signed prior to kickoff.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
