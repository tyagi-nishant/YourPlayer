import React, { useState } from 'react';
import { ThemeMode, PaletteTone } from '../types';
import { Eye, Type, Sliders, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

interface DesignLabSandboxProps {
  theme: ThemeMode;
  paletteTone: PaletteTone;
}

export const DesignLabSandbox: React.FC<DesignLabSandboxProps> = ({
  theme,
  paletteTone,
}) => {
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<'contrast' | 'typography' | 'spring'>('contrast');

  // 1. Contrast State
  const [fgColor, setFgColor] = useState<string>('#0F172A');
  const [bgColor, setBgColor] = useState<string>('#FFFFFF');

  // Simple relative luminance calculation
  const getLuminance = (hex: string) => {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

    const a = [r, g, b].map((v) => {
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const getContrastRatio = (c1: string, c2: string) => {
    try {
      const l1 = getLuminance(c1);
      const l2 = getLuminance(c2);
      const brightest = Math.max(l1, l2);
      const darkest = Math.min(l1, l2);
      return (brightest + 0.05) / (darkest + 0.05);
    } catch {
      return 4.5;
    }
  };

  const contrastRatio = getContrastRatio(fgColor, bgColor);
  const passesAANormal = contrastRatio >= 4.5;
  const passesAALarge = contrastRatio >= 3.0;
  const passesAAA = contrastRatio >= 7.0;

  // 2. Typography Scale State
  const [baseFontSize, setBaseFontSize] = useState<number>(16);
  const [lineHeightMultiplier, setLineHeightMultiplier] = useState<number>(1.6);
  const [letterSpacingVal, setLetterSpacingVal] = useState<number>(-0.02);
  const [typeScaleRatio, setTypeScaleRatio] = useState<number>(1.25); // Major Third

  // 3. Spring Micro-interaction State
  const [stiffness, setStiffness] = useState<number>(300);
  const [damping, setDamping] = useState<number>(20);
  const [clickCount, setClickCount] = useState<number>(0);
  const [isPressing, setIsPressing] = useState<boolean>(false);

  return (
    <section id="lab" className="py-20 lg:py-28 border-t border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12">
          <div className="text-xs font-mono uppercase tracking-wider opacity-60 mb-2">
            The Craft Behind The Interface
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Design Systems &amp; Ergonomics Lab.
              </h2>
              <p className="text-sm opacity-70 mt-2 max-w-xl">
                We obsess over mathematical foundations: optical contrast ratios, typographic scales, and physical damping curves. Interact with our live engine benchmarks below.
              </p>
            </div>

            {/* Segmented controls for lab tabs */}
            <div
              className={`flex items-center p-1 rounded-lg border ${
                isDark
                  ? 'bg-neutral-900 border-neutral-800'
                  : 'bg-neutral-100 border-neutral-200'
              }`}
            >
              <button
                onClick={() => setActiveTab('contrast')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === 'contrast'
                    ? isDark
                      ? 'bg-neutral-800 text-white shadow-sm font-semibold'
                      : 'bg-white text-neutral-900 shadow-sm font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>WCAG Contrast</span>
              </button>
              <button
                onClick={() => setActiveTab('typography')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === 'typography'
                    ? isDark
                      ? 'bg-neutral-800 text-white shadow-sm font-semibold'
                      : 'bg-white text-neutral-900 shadow-sm font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>Typographic Scale</span>
              </button>
              <button
                onClick={() => setActiveTab('spring')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === 'spring'
                    ? isDark
                      ? 'bg-neutral-800 text-white shadow-sm font-semibold'
                      : 'bg-white text-neutral-900 shadow-sm font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Kinetic Springs</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: WCAG Contrast & Accessibility Inspector */}
        {activeTab === 'contrast' && (
          <div
            className={`rounded-2xl border p-6 sm:p-8 ${
              isDark ? 'bg-neutral-900/80 border-neutral-800' : 'bg-white border-neutral-200'
            }`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Controls */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <h3 className="text-lg font-bold mb-1">
                    WCAG AA/AAA Ratio Auditor
                  </h3>
                  <p className="text-xs opacity-70">
                    Verify compliance in real-time according to W3C relative luminance guidelines.
                  </p>
                </div>

                <div className="space-y-4 text-xs font-medium">
                  <div>
                    <label className="block text-neutral-500 mb-1.5">
                      Foreground Text Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="w-10 h-10 rounded border cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="w-32 px-3 py-2 rounded border font-mono text-xs uppercase bg-transparent"
                      />
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setFgColor('#0F172A')}
                          className="px-2 py-1 text-[11px] rounded border"
                        >
                          Slate
                        </button>
                        <button
                          onClick={() => setFgColor('#FFFFFF')}
                          className="px-2 py-1 text-[11px] rounded border"
                        >
                          White
                        </button>
                        <button
                          onClick={() => setFgColor('#1E40AF')}
                          className="px-2 py-1 text-[11px] rounded border"
                        >
                          Cobalt
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-neutral-500 mb-1.5">
                      Background Canvas Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-10 h-10 rounded border cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-32 px-3 py-2 rounded border font-mono text-xs uppercase bg-transparent"
                      />
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setBgColor('#FFFFFF')}
                          className="px-2 py-1 text-[11px] rounded border"
                        >
                          Light
                        </button>
                        <button
                          onClick={() => setBgColor('#0A0A0C')}
                          className="px-2 py-1 text-[11px] rounded border"
                        >
                          Dark
                        </button>
                        <button
                          onClick={() => setBgColor('#F4F4F5')}
                          className="px-2 py-1 text-[11px] rounded border"
                        >
                          Zinc
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Compliance scorecard */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 text-center">
                    <span className="text-[10px] uppercase font-mono block opacity-60">AA Normal</span>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      {passesAANormal ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500" />
                      )}
                      <span className="text-xs font-bold">{passesAANormal ? 'PASS' : 'FAIL'}</span>
                    </div>
                    <span className="text-[9px] opacity-50 block mt-0.5">&ge; 4.5:1</span>
                  </div>

                  <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 text-center">
                    <span className="text-[10px] uppercase font-mono block opacity-60">AA Large</span>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      {passesAALarge ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500" />
                      )}
                      <span className="text-xs font-bold">{passesAALarge ? 'PASS' : 'FAIL'}</span>
                    </div>
                    <span className="text-[9px] opacity-50 block mt-0.5">&ge; 3.0:1</span>
                  </div>

                  <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 text-center">
                    <span className="text-[10px] uppercase font-mono block opacity-60">AAA Enhanced</span>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      {passesAAA ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500" />
                      )}
                      <span className="text-xs font-bold">{passesAAA ? 'PASS' : 'FAIL'}</span>
                    </div>
                    <span className="text-[9px] opacity-50 block mt-0.5">&ge; 7.0:1</span>
                  </div>
                </div>
              </div>

              {/* Live Render Canvas */}
              <div className="lg:col-span-7">
                <div
                  className="rounded-xl p-8 border shadow-inner flex flex-col justify-between min-h-[280px] transition-colors"
                  style={{ backgroundColor: bgColor, color: fgColor }}
                >
                  <div className="flex items-center justify-between text-xs font-mono opacity-60 mb-6">
                    <span>LIVE CONTRAST RENDERING CANVAS</span>
                    <span className="text-base font-bold tabular-nums">
                      {contrastRatio.toFixed(2)} : 1
                    </span>
                  </div>

                  <div>
                    <h4 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
                      Precision interfaces respect the reader.
                    </h4>
                    <p className="text-sm leading-relaxed opacity-90 max-w-lg">
                      Clear visual hierarchy, sufficient photonic contrast, and balanced typographic rhythm form the foundation of fatigue-free human digital tools.
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-current/20 flex items-center justify-between text-xs font-mono opacity-70">
                    <span>STATUS: {contrastRatio >= 4.5 ? 'COMPLIANT' : 'SUB-OPTIMAL'}</span>
                    <span>W3C SPECIFICATION 2.1</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Typographic Scale Simulator */}
        {activeTab === 'typography' && (
          <div
            className={`rounded-2xl border p-6 sm:p-8 ${
              isDark ? 'bg-neutral-900/80 border-neutral-800' : 'bg-white border-neutral-200'
            }`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Controls */}
              <div className="lg:col-span-4 space-y-6">
                <div>
                  <h3 className="text-lg font-bold mb-1">Scale Math Controls</h3>
                  <p className="text-xs opacity-70">
                    Tune the display typography matrix and inspect spatial cadence.
                  </p>
                </div>

                <div className="space-y-4 text-xs font-medium">
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-neutral-500">Base Font Size</label>
                      <span className="font-mono tabular-nums">{baseFontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min={12}
                      max={20}
                      step={1}
                      value={baseFontSize}
                      onChange={(e) => setBaseFontSize(Number(e.target.value))}
                      className="w-full accent-neutral-900 dark:accent-neutral-100 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-neutral-500">Line Height Multiple</label>
                      <span className="font-mono tabular-nums">{lineHeightMultiplier.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={1.2}
                      max={2.0}
                      step={0.05}
                      value={lineHeightMultiplier}
                      onChange={(e) => setLineHeightMultiplier(Number(e.target.value))}
                      className="w-full accent-neutral-900 dark:accent-neutral-100 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-neutral-500">Tracking (Letter Spacing)</label>
                      <span className="font-mono tabular-nums">{letterSpacingVal.toFixed(2)}em</span>
                    </div>
                    <input
                      type="range"
                      min={-0.05}
                      max={0.05}
                      step={0.01}
                      value={letterSpacingVal}
                      onChange={(e) => setLetterSpacingVal(Number(e.target.value))}
                      className="w-full accent-neutral-900 dark:accent-neutral-100 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-500 mb-1.5">Harmonic Ratio</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Major 2nd (1.125)', val: 1.125 },
                        { label: 'Minor 3rd (1.200)', val: 1.2 },
                        { label: 'Major 3rd (1.250)', val: 1.25 },
                        { label: 'Perfect 4th (1.333)', val: 1.333 },
                      ].map((ratio) => (
                        <button
                          key={ratio.label}
                          onClick={() => setTypeScaleRatio(ratio.val)}
                          className={`p-2 rounded border text-[11px] text-left transition-colors ${
                            typeScaleRatio === ratio.val
                              ? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900 font-bold'
                              : 'border-neutral-200 dark:border-neutral-800 opacity-70 hover:opacity-100'
                          }`}
                        >
                          {ratio.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Scale Hierarchy */}
              <div className="lg:col-span-8 space-y-4">
                {[
                  { level: 'Display Hero', factor: Math.pow(typeScaleRatio, 4), label: 'Scale 4' },
                  { level: 'Section Title', factor: Math.pow(typeScaleRatio, 3), label: 'Scale 3' },
                  { level: 'Card Header', factor: Math.pow(typeScaleRatio, 2), label: 'Scale 2' },
                  { level: 'Body Prose', factor: 1, label: 'Base' },
                ].map((item, idx) => {
                  const size = Math.round(baseFontSize * item.factor);
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40"
                    >
                      <div className="flex items-center justify-between text-xs font-mono opacity-50 mb-2">
                        <span>{item.level} ({item.label})</span>
                        <span>{size}px · tracking: {letterSpacingVal}em</span>
                      </div>
                      <div
                        style={{
                          fontSize: `${size}px`,
                          lineHeight: lineHeightMultiplier,
                          letterSpacing: `${letterSpacingVal}em`,
                          fontFamily: 'var(--font-sans)',
                          fontWeight: item.factor > 1.2 ? 700 : 400,
                        }}
                        className="truncate"
                      >
                        Architectural interfaces engineered for scale.
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Kinetic Springs Physics Sandbox */}
        {activeTab === 'spring' && (
          <div
            className={`rounded-2xl border p-6 sm:p-8 ${
              isDark ? 'bg-neutral-900/80 border-neutral-800' : 'bg-white border-neutral-200'
            }`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <h3 className="text-lg font-bold mb-1">Spring Micro-Physics</h3>
                  <p className="text-xs opacity-70">
                    Physical spring curves make UI elements feel tactile, weighted, and responsive.
                  </p>
                </div>

                <div className="space-y-4 text-xs font-medium">
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-neutral-500">Stiffness (Tension)</label>
                      <span className="font-mono tabular-nums">{stiffness}</span>
                    </div>
                    <input
                      type="range"
                      min={100}
                      max={600}
                      step={20}
                      value={stiffness}
                      onChange={(e) => setStiffness(Number(e.target.value))}
                      className="w-full accent-neutral-900 dark:accent-neutral-100 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-neutral-500">Damping (Friction)</label>
                      <span className="font-mono tabular-nums">{damping}</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={50}
                      step={2}
                      value={damping}
                      onChange={(e) => setDamping(Number(e.target.value))}
                      className="w-full accent-neutral-900 dark:accent-neutral-100 cursor-pointer"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setStiffness(300);
                        setDamping(20);
                      }}
                      className="px-3 py-1.5 rounded border text-xs flex items-center gap-1.5 opacity-70 hover:opacity-100"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset to Studio Default</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Interactive Target */}
              <div className="lg:col-span-7 flex flex-col items-center justify-center p-12 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/60 min-h-[300px]">
                <div className="text-xs font-mono opacity-50 mb-6">
                  CLICK / TAP TARGET BELOW TO TRIGGER SETTLING
                </div>

                <button
                  onMouseDown={() => setIsPressing(true)}
                  onMouseUp={() => {
                    setIsPressing(false);
                    setClickCount((c) => c + 1);
                  }}
                  onMouseLeave={() => setIsPressing(false)}
                  style={{
                    transform: isPressing
                      ? `scale(0.92)`
                      : `scale(1)`,
                    transition: `transform 180ms cubic-bezier(0.16, 1, 0.3, 1)`,
                  }}
                  className={`px-8 py-5 rounded-2xl text-base font-bold text-white shadow-xl cursor-pointer select-none active:outline-none focus-visible:ring-4 ${
                    paletteTone === 'cobalt'
                      ? 'bg-blue-600 shadow-blue-500/20'
                      : paletteTone === 'sandstone'
                      ? 'bg-amber-600 shadow-amber-500/20'
                      : isDark
                      ? 'bg-neutral-100 text-neutral-900'
                      : 'bg-neutral-900'
                  }`}
                >
                  Tactile Spring Affordance
                </button>

                <div className="mt-8 flex items-center gap-6 text-xs font-mono opacity-60">
                  <span>Triggers Fired: {clickCount}</span>
                  <span aria-hidden="true">·</span>
                  <span>Response Latency: &le; 16ms</span>
                  <span aria-hidden="true">·</span>
                  <span>GPU Composited</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
