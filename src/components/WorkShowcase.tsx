import React, { useState } from 'react';
import { ProjectCaseStudy, ThemeMode, PaletteTone } from '../types';
import { CASE_STUDIES } from '../data/content';
import { ArrowUpRight, Search, TrendingUp, Navigation, Compass, Activity } from 'lucide-react';

interface WorkShowcaseProps {
  theme: ThemeMode;
  paletteTone: PaletteTone;
  onSelectProject: (project: ProjectCaseStudy) => void;
}

export const WorkShowcase: React.FC<WorkShowcaseProps> = ({
  theme,
  paletteTone,
  onSelectProject,
}) => {
  const isDark = theme === 'dark';
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', 'Fintech', 'Mobility', 'Spatial', 'Healthcare'];

  const filteredProjects = CASE_STUDIES.filter((project) => {
    const matchesCategory =
      selectedCategory === 'All' || project.category === selectedCategory;
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.technologies.some((t) =>
        t.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="work" className="py-20 lg:py-28 border-t border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider opacity-60 mb-2">
              Selected Work · 2024–2026
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Production systems built for impact.
            </h2>
          </div>

          <p className="text-sm opacity-70 max-w-md">
            Every case study below represents real, shipped software supporting thousands of concurrent active workflows and quantified client returns.
          </p>
        </div>

        {/* Filter Bar & Search Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-neutral-200 dark:border-neutral-800">
          {/* Category Filter Controls (Buttons with segmented style, NOT pills) */}
          <div
            className={`flex items-center gap-1 p-1 rounded-lg border overflow-x-auto ${
              isDark
                ? 'bg-neutral-900 border-neutral-800'
                : 'bg-neutral-100 border-neutral-200'
            }`}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? isDark
                      ? 'bg-neutral-800 text-white shadow-sm font-semibold'
                      : 'bg-white text-neutral-900 shadow-sm font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search case studies & tech..."
              className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border transition-colors outline-none focus:ring-1 ${
                isDark
                  ? 'bg-neutral-900 border-neutral-800 text-neutral-100 placeholder-neutral-500 focus:border-neutral-700 focus:ring-neutral-700'
                  : 'bg-white border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-neutral-400 focus:ring-neutral-400'
              }`}
            />
          </div>
        </div>

        {/* Bento Grid Layout */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16 border rounded-xl border-dashed border-neutral-300 dark:border-neutral-800">
            <p className="text-sm opacity-60">No case studies match your filter criteria.</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="mt-3 text-xs font-semibold underline underline-offset-4"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {filteredProjects.map((project, idx) => {
              // Asymmetric Bento logic: First item gets 8 cols on large screens, second gets 4, others 6
              const isFeatured = idx === 0;
              const colSpanClass = isFeatured
                ? 'lg:col-span-8'
                : idx === 1
                ? 'lg:col-span-4'
                : 'lg:col-span-6';

              return (
                <article
                  key={project.id}
                  onClick={() => onSelectProject(project)}
                  className={`${colSpanClass} group cursor-pointer flex flex-col justify-between rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isDark
                      ? 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
                      : 'bg-white border-neutral-200 hover:border-neutral-300 hover:shadow-lg'
                  }`}
                >
                  {/* Visual Artwork Showcase Container (100% resilient SVG/CSS vector representation) */}
                  <div className="relative w-full h-56 sm:h-72 overflow-hidden border-b border-neutral-200 dark:border-neutral-800 bg-neutral-950 flex items-center justify-center p-6">
                    {/* Background grid */}
                    <div
                      className="absolute inset-0 opacity-15"
                      style={{
                        backgroundImage:
                          'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                      }}
                    />

                    {/* Dedicated Artistic Visual Canvas for each project archetype */}
                    {project.id === 'meridian-os' && (
                      <div className="relative z-10 w-full max-w-md h-full flex flex-col justify-between p-4 rounded-xl border border-neutral-800 bg-neutral-900/90 shadow-2xl transition-transform group-hover:scale-[1.02]">
                        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                          <span className="flex items-center gap-1.5 text-emerald-400">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>MERIDIAN // RISK MATRIX</span>
                          </span>
                          <span className="tabular-nums">STREAM: 0.8ms</span>
                        </div>
                        {/* Candlestick / Order depth chart representation */}
                        <div className="h-28 flex items-end justify-between gap-1.5 py-2">
                          {[35, 48, 62, 54, 78, 65, 88, 92, 84, 96, 110, 104, 128].map(
                            (val, barIdx) => (
                              <div
                                key={barIdx}
                                className="flex-1 flex flex-col items-center gap-1"
                              >
                                <div
                                  className="w-full rounded-sm bg-gradient-to-t from-emerald-500/80 to-teal-300"
                                  style={{ height: `${val * 0.7}%` }}
                                />
                              </div>
                            )
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 pt-1 border-t border-neutral-800">
                          <span>AUM: $14.2B</span>
                          <span className="text-emerald-400 font-semibold tabular-nums">
                            +184% VELOCITY
                          </span>
                        </div>
                      </div>
                    )}

                    {project.id === 'kallisto-mobility' && (
                      <div className="relative z-10 w-full max-w-md h-full flex flex-col justify-between p-4 rounded-xl border border-neutral-800 bg-neutral-900/90 shadow-2xl transition-transform group-hover:scale-[1.02]">
                        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                          <span className="flex items-center gap-1.5 text-blue-400">
                            <Navigation className="w-3.5 h-3.5" />
                            <span>KALLISTO // TELEMETRY GRID</span>
                          </span>
                          <span className="text-blue-400 tabular-nums">1,200 ACTIVE PODS</span>
                        </div>
                        {/* Spatial radar and path vectors */}
                        <div className="relative h-28 flex items-center justify-center">
                          <div className="w-24 h-24 rounded-full border border-blue-500/30 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full border border-blue-500/50 flex items-center justify-center">
                              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]" />
                            </div>
                          </div>
                          {/* Route vectors */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-36 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent rotate-45" />
                            <div className="w-36 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent -rotate-30" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 pt-1 border-t border-neutral-800">
                          <span>DISPATCH TRIAGE</span>
                          <span className="text-blue-400 font-semibold tabular-nums">
                            -68% LATENCY
                          </span>
                        </div>
                      </div>
                    )}

                    {project.id === 'nordik-spatial' && (
                      <div className="relative z-10 w-full max-w-md h-full flex flex-col justify-between p-4 rounded-xl border border-neutral-800 bg-neutral-900/90 shadow-2xl transition-transform group-hover:scale-[1.02]">
                        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                          <span className="flex items-center gap-1.5 text-amber-400">
                            <Compass className="w-3.5 h-3.5" />
                            <span>NORDIK // SPATIAL ATELIER</span>
                          </span>
                          <span className="text-amber-400 tabular-nums">SOLAR SIM: 55° N</span>
                        </div>
                        {/* Isometric architectural silhouette */}
                        <div className="h-28 flex items-center justify-center">
                          <svg
                            viewBox="0 0 200 100"
                            className="w-48 h-24 stroke-amber-500/70 fill-none"
                            strokeWidth="1.5"
                          >
                            <polygon points="100,10 180,45 100,80 20,45" />
                            <line x1="20" y1="45" x2="20" y2="75" />
                            <line x1="100" y1="80" x2="100" y2="100" />
                            <line x1="180" y1="45" x2="180" y2="75" />
                            <polygon
                              points="20,75 100,100 180,75"
                              className="fill-amber-500/10"
                            />
                            <circle cx="100" cy="45" r="8" className="stroke-amber-300" />
                          </svg>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 pt-1 border-t border-neutral-800">
                          <span>BIM SPEC EXPORT</span>
                          <span className="text-amber-400 font-semibold tabular-nums">
                            +142% SPEC CONVERSION
                          </span>
                        </div>
                      </div>
                    )}

                    {project.id === 'helix-bio' && (
                      <div className="relative z-10 w-full max-w-md h-full flex flex-col justify-between p-4 rounded-xl border border-neutral-800 bg-neutral-900/90 shadow-2xl transition-transform group-hover:scale-[1.02]">
                        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                          <span className="flex items-center gap-1.5 text-purple-400">
                            <Activity className="w-3.5 h-3.5" />
                            <span>HELIX // GENOMIC LOCUS</span>
                          </span>
                          <span className="text-purple-400 tabular-nums">CHR 17:q21.31</span>
                        </div>
                        {/* DNA / Chromosome coordinate graph */}
                        <div className="h-28 flex items-center justify-center">
                          <svg
                            viewBox="0 0 240 80"
                            className="w-56 h-20 stroke-purple-400 fill-none"
                            strokeWidth="2"
                          >
                            <path d="M 10 40 Q 40 10, 70 40 T 130 40 T 190 40 T 230 40" />
                            <path
                              d="M 10 40 Q 40 70, 70 40 T 130 40 T 190 40 T 230 40"
                              className="stroke-violet-500"
                              strokeDasharray="4 4"
                            />
                            <circle cx="70" cy="40" r="4" className="fill-purple-300" />
                            <circle cx="130" cy="40" r="4" className="fill-purple-300" />
                            <circle cx="190" cy="40" r="4" className="fill-purple-300" />
                          </svg>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 pt-1 border-t border-neutral-800">
                          <span>PATHOLOGY AUDIT</span>
                          <span className="text-purple-400 font-semibold tabular-nums">
                            -52% REVIEW TIME
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Content Information */}
                  <div className="p-6 flex flex-col justify-between flex-grow">
                    <div>
                      {/* Unboxed Metadata (NO PILLS) */}
                      <div className="flex items-center gap-2 text-xs opacity-60 mb-2 font-mono">
                        <span>{project.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{project.client}</span>
                        <span aria-hidden="true">·</span>
                        <span>{project.year}</span>
                      </div>

                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h3 className="text-xl font-bold tracking-tight group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                          {project.title}
                        </h3>
                        <ArrowUpRight className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity shrink-0" />
                      </div>

                      <p className="text-sm opacity-75 line-clamp-2 mb-4 leading-relaxed font-normal">
                        {project.summary}
                      </p>
                    </div>

                    {/* Footer Deliverable line + primary metric */}
                    <div className="pt-4 border-t border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between text-xs">
                      <span className="opacity-60 truncate max-w-[60%]">
                        {project.deliverables.slice(0, 2).join(' · ')}
                      </span>
                      <span className="font-bold text-neutral-900 dark:text-neutral-100 tabular-nums font-mono">
                        {project.metrics[0].value} {project.metrics[0].label}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
