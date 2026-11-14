import React from 'react';
import { Play } from 'lucide-react';

export type DiscoveryCategoryTab =
  | 'all'
  | 'recommended'
  | 'upcoming'
  | 'trending'
  | 'top_rated';

interface AppHeaderProps {
  currentView: 'home' | 'internal' | 'player';
  activeCategory: DiscoveryCategoryTab;
  hasActiveMedia: boolean;
  internalEndpointsCount: number;
  onSelectCategory: (cat: DiscoveryCategoryTab) => void;
  onOpenInternalEndpoints: () => void;
  onReturnToPlayer: () => void;
  onFocusUrlInput: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentView,
  activeCategory,
  hasActiveMedia,
  internalEndpointsCount,
  onSelectCategory,
  onOpenInternalEndpoints,
  onReturnToPlayer,
  onFocusUrlInput,
}) => {
  const handleNavClick = (cat: DiscoveryCategoryTab, sectionId?: string) => {
    onSelectCategory(cat);
    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#08080c]/85 backdrop-blur-xl border-b border-white/[0.07]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single clean text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="text-lg font-extrabold tracking-tight text-white hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
        >
          PlaySpace
        </a>

        {/* Zone 2: 5 concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-400">
          <a
            href="#discover-hub"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('all', 'discover-hub');
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
              currentView === 'home' && activeCategory === 'all'
                ? 'text-white underline decoration-amber-500 decoration-2 underline-offset-8'
                : ''
            }`}
          >
            Discover
          </a>

          <a
            href="#discover-hub"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('recommended', 'discover-hub');
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
              currentView === 'home' && activeCategory === 'recommended'
                ? 'text-white underline decoration-amber-500 decoration-2 underline-offset-8'
                : ''
            }`}
          >
            Recommendations
          </a>

          <a
            href="#discover-hub"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('upcoming', 'discover-hub');
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
              currentView === 'home' && activeCategory === 'upcoming'
                ? 'text-white underline decoration-amber-500 decoration-2 underline-offset-8'
                : ''
            }`}
          >
            Upcoming
          </a>

          <a
            href="#internal-endpoints"
            onClick={(e) => {
              e.preventDefault();
              onOpenInternalEndpoints();
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 tabular-nums ${
              currentView === 'internal'
                ? 'text-white underline decoration-amber-500 decoration-2 underline-offset-8'
                : ''
            }`}
          >
            {internalEndpointsCount > 0
              ? `Internal Endpoints (${internalEndpointsCount})`
              : 'Internal Endpoints'}
          </a>

          {hasActiveMedia ? (
            <a
              href="#player"
              onClick={(e) => {
                e.preventDefault();
                onReturnToPlayer();
              }}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
                currentView === 'player'
                  ? 'text-white underline decoration-amber-500 decoration-2 underline-offset-8'
                  : ''
              }`}
            >
              Now Playing
            </a>
          ) : (
            <a
              href="#custom-url-studio"
              onClick={(e) => {
                e.preventDefault();
                onFocusUrlInput();
              }}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 py-1"
            >
              URL Player
            </a>
          )}
        </nav>

        {/* Zone 3: 1 Primary CTA button */}
        <div className="flex items-center gap-3 shrink-0">
          {currentView !== 'player' && hasActiveMedia ? (
            <button
              type="button"
              onClick={onReturnToPlayer}
              className="px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Resume Player</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onFocusUrlInput}
              className="px-4 py-2 text-xs font-semibold text-neutral-950 bg-white hover:bg-neutral-200 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Open Stream URL
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
