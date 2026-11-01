import React, { useState } from 'react';
import { PaletteTone, ThemeMode } from '../types';
import { Sun, Moon, Sparkles, Menu, X, ArrowUpRight } from 'lucide-react';

interface HeaderProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  paletteTone: PaletteTone;
  onChangeTone: (tone: PaletteTone) => void;
  onOpenBooking: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  paletteTone,
  onChangeTone,
  onOpenBooking,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isDark = theme === 'dark';

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-colors duration-200 border-b ${
        isDark
          ? 'bg-neutral-950/80 border-neutral-800/80 text-neutral-100 backdrop-blur-md'
          : 'bg-white/85 border-neutral-200/80 text-neutral-900 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#"
            className="text-lg font-bold tracking-tight uppercase flex items-center gap-2 group whitespace-nowrap shrink-0"
          >
            <span
              className={`w-2.5 h-2.5 rounded-sm transition-transform group-hover:rotate-45 ${
                paletteTone === 'cobalt'
                  ? 'bg-blue-500'
                  : paletteTone === 'sandstone'
                  ? 'bg-amber-600'
                  : isDark
                  ? 'bg-white'
                  : 'bg-neutral-900'
              }`}
            />
            <span>AURA</span>
            <span className="text-xs font-normal opacity-50 tracking-widest hidden sm:inline">
              STUDIO
            </span>
          </a>
        </div>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <a
            href="#play"
            className="hover:opacity-100 opacity-90 font-semibold transition-opacity whitespace-nowrap shrink-0 py-1"
          >
            Play Screen
          </a>
          <a
            href="#work"
            className="hover:opacity-100 opacity-70 transition-opacity whitespace-nowrap shrink-0 py-1"
          >
            Work
          </a>
          <a
            href="#capabilities"
            className="hover:opacity-100 opacity-70 transition-opacity whitespace-nowrap shrink-0 py-1"
          >
            Capabilities
          </a>
          <a
            href="#estimator"
            className="hover:opacity-100 opacity-70 transition-opacity whitespace-nowrap shrink-0 py-1"
          >
            Estimator
          </a>
          <a
            href="#lab"
            className="hover:opacity-100 opacity-70 transition-opacity whitespace-nowrap shrink-0 py-1"
          >
            Design Lab
          </a>
        </nav>

        {/* Zone 3: Primary action + interactive controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Tone Selector dropdown or segmented buttons */}
          <div
            className={`hidden lg:flex items-center p-0.5 rounded-md text-xs font-medium border ${
              isDark
                ? 'bg-neutral-900 border-neutral-800 text-neutral-400'
                : 'bg-neutral-100 border-neutral-200 text-neutral-600'
            }`}
            title="Switch Aesthetic Palette"
          >
            <button
              onClick={() => onChangeTone('obsidian')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                paletteTone === 'obsidian'
                  ? isDark
                    ? 'bg-neutral-800 text-white font-semibold'
                    : 'bg-white text-neutral-900 shadow-sm font-semibold'
                  : 'hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Obsidian
            </button>
            <button
              onClick={() => onChangeTone('cobalt')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                paletteTone === 'cobalt'
                  ? isDark
                    ? 'bg-blue-950 text-blue-200 border border-blue-800 font-semibold'
                    : 'bg-white text-blue-700 shadow-sm font-semibold'
                  : 'hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Cobalt
            </button>
            <button
              onClick={() => onChangeTone('sandstone')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                paletteTone === 'sandstone'
                  ? isDark
                    ? 'bg-amber-950/60 text-amber-200 border border-amber-800 font-semibold'
                    : 'bg-white text-amber-800 shadow-sm font-semibold'
                  : 'hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Sandstone
            </button>
          </div>

          {/* Theme mode toggle */}
          <button
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`p-2 rounded-md transition-colors border ${
              isDark
                ? 'border-neutral-800 hover:bg-neutral-800 text-neutral-300'
                : 'border-neutral-200 hover:bg-neutral-100 text-neutral-700'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Single primary CTA button */}
          <button
            onClick={onOpenBooking}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm active:scale-98 ${
              paletteTone === 'cobalt'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : paletteTone === 'sandstone'
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : isDark
                ? 'bg-neutral-100 hover:bg-white text-neutral-900'
                : 'bg-neutral-900 hover:bg-neutral-800 text-white'
            }`}
          >
            <span>Start a Project</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-md border ${
              isDark
                ? 'border-neutral-800 hover:bg-neutral-800'
                : 'border-neutral-200 hover:bg-neutral-100'
            }`}
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden px-6 py-6 border-b space-y-4 ${
            isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-200'
          }`}
        >
          <div className="flex flex-col gap-3 text-sm font-medium">
            <a
              href="#play"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:opacity-100 font-semibold"
            >
              Play Screen &amp; Video Hub
            </a>
            <a
              href="#work"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:opacity-100 opacity-80"
            >
              Work &amp; Case Studies
            </a>
            <a
              href="#capabilities"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:opacity-100 opacity-80"
            >
              Capabilities &amp; Services
            </a>
            <a
              href="#estimator"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:opacity-100 opacity-80"
            >
              Project Estimator
            </a>
            <a
              href="#lab"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:opacity-100 opacity-80"
            >
              Design &amp; Accessibility Lab
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:opacity-100 opacity-80"
            >
              Frequently Asked Questions
            </a>
          </div>

          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <span className="text-xs text-neutral-500">Palette Theme</span>
            <div className="flex gap-2">
              {(['obsidian', 'cobalt', 'sandstone'] as PaletteTone[]).map((t) => (
                <button
                  key={t}
                  onClick={() => onChangeTone(t)}
                  className={`px-2 py-1 text-xs rounded uppercase font-mono ${
                    paletteTone === t
                      ? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900 font-bold'
                      : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                >
                  {t.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
