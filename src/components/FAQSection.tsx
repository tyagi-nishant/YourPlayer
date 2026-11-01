import React, { useState } from 'react';
import { ThemeMode, PaletteTone } from '../types';
import { FREQUENTLY_ASKED_QUESTIONS } from '../data/content';
import { Plus, Minus } from 'lucide-react';

interface FAQSectionProps {
  theme: ThemeMode;
  paletteTone: PaletteTone;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ theme, paletteTone }) => {
  const isDark = theme === 'dark';
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section id="faq" className="py-20 lg:py-28 border-t border-neutral-200 dark:border-neutral-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="text-xs font-mono uppercase tracking-wider opacity-60 mb-2">
            Clear Partnerships
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm opacity-70 mt-2 max-w-lg mx-auto">
            Everything you need to know about our sprints, code handover, and engineering process.
          </p>
        </div>

        <div className="space-y-3">
          {FREQUENTLY_ASKED_QUESTIONS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-xl border transition-all ${
                  isDark
                    ? 'bg-neutral-900/60 border-neutral-800'
                    : 'bg-white border-neutral-200 shadow-2xs'
                }`}
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-semibold text-base focus:outline-none"
                >
                  <span className="leading-snug">{item.question}</span>
                  <div
                    className={`p-1 rounded-md border shrink-0 transition-colors ${
                      isDark ? 'border-neutral-800' : 'border-neutral-200'
                    }`}
                  >
                    {isOpen ? (
                      <Minus className="w-4 h-4 opacity-70" />
                    ) : (
                      <Plus className="w-4 h-4 opacity-70" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 text-sm opacity-80 leading-relaxed border-t border-neutral-100 dark:border-neutral-800/60 pt-4 font-normal">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
