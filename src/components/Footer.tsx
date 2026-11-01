import React, { useState, useEffect } from 'react';
import { ThemeMode, PaletteTone } from '../types';
import { ArrowUp } from 'lucide-react';

interface FooterProps {
  theme: ThemeMode;
  paletteTone: PaletteTone;
}

export const Footer: React.FC<FooterProps> = ({ theme, paletteTone }) => {
  const isDark = theme === 'dark';

  // Live clocks for studio locations
  const [times, setTimes] = useState({
    sf: '',
    london: '',
    tokyo: '',
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimes({
        sf: now.toLocaleTimeString('en-US', {
          timeZone: 'America/Los_Angeles',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
        london: now.toLocaleTimeString('en-GB', {
          timeZone: 'Europe/London',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
        tokyo: now.toLocaleTimeString('en-US', {
          timeZone: 'Asia/Tokyo',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
      });
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      className={`border-t transition-colors ${
        isDark
          ? 'bg-neutral-950 border-neutral-800 text-neutral-400'
          : 'bg-neutral-50 border-neutral-200 text-neutral-600'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          {/* Brand info (4 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-bold text-lg tracking-tight uppercase">
              <span
                className={`w-2 h-2 rounded-sm ${
                  paletteTone === 'cobalt'
                    ? 'bg-blue-500'
                    : paletteTone === 'sandstone'
                    ? 'bg-amber-600'
                    : isDark
                    ? 'bg-white'
                    : 'bg-neutral-900'
                }`}
              />
              <span>AURA STUDIO &amp; LABS</span>
            </div>

            <p className="text-xs leading-relaxed max-w-sm opacity-80">
              An independent design studio &amp; software engineering atelier. We build human-centered platforms, modular design systems, and rapid mission-critical web applications.
            </p>

            {/* Timezone Locations with Tabular Numerals */}
            <div className="pt-2 flex items-center gap-4 text-xs font-mono">
              <div>
                <span className="opacity-50 block text-[10px]">SAN FRANCISCO</span>
                <span className="tabular-nums font-semibold text-neutral-900 dark:text-neutral-200">
                  {times.sf || '07:00'} PST
                </span>
              </div>
              <span className="opacity-30">/</span>
              <div>
                <span className="opacity-50 block text-[10px]">LONDON</span>
                <span className="tabular-nums font-semibold text-neutral-900 dark:text-neutral-200">
                  {times.london || '15:00'} GMT
                </span>
              </div>
              <span className="opacity-30">/</span>
              <div>
                <span className="opacity-50 block text-[10px]">TOKYO</span>
                <span className="tabular-nums font-semibold text-neutral-900 dark:text-neutral-200">
                  {times.tokyo || '00:00'} JST
                </span>
              </div>
            </div>
          </div>

          {/* Quick links (3 cols) */}
          <div className="md:col-span-3 space-y-2 text-xs">
            <div className="font-semibold text-neutral-900 dark:text-neutral-200 uppercase tracking-wider mb-3">
              Navigation
            </div>
            <ul className="space-y-2">
              <li>
                <a href="#play" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Play Screen &amp; Video Hub
                </a>
              </li>
              <li>
                <a href="#work" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Selected Work &amp; Benchmarks
                </a>
              </li>
              <li>
                <a href="#capabilities" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Engineering Capabilities
                </a>
              </li>
              <li>
                <a href="#estimator" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Interactive Scope Estimator
                </a>
              </li>
              <li>
                <a href="#lab" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Design Systems &amp; WCAG Lab
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Partnership FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Standards & Philosophy (4 cols) */}
          <div className="md:col-span-4 space-y-2 text-xs">
            <div className="font-semibold text-neutral-900 dark:text-neutral-200 uppercase tracking-wider mb-3">
              Studio Standards
            </div>
            <p className="opacity-80 leading-relaxed text-[11px]">
              Every line of code delivered is tested against strict WCAG AA contrast, sub-500ms First Contentful Paint, and zero unhandled exceptions. We do not use bloated multi-megabyte UI libraries or opaque wrappers.
            </p>
            <div className="pt-2 text-[11px] opacity-60">
              Direct inquiries:{' '}
              <a
                href="mailto:inquire@aurastudio.design"
                className="underline underline-offset-2 hover:opacity-100"
              >
                inquire@aurastudio.design
              </a>
            </div>
          </div>
        </div>

        {/* Bottom row: copyright & scroll to top */}
        <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} Aura Studio &amp; Labs Inc.</span>
            <span aria-hidden="true">·</span>
            <span>All rights reserved.</span>
            <span aria-hidden="true">·</span>
            <span>Privacy &amp; Terms</span>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
