import React, { useState } from 'react';
import { RecentMediaItem } from '../types';
import { PlatformBadge } from './PlatformBadge';
import { EmptyState } from './EmptyState';
import {
  Play,
  Trash2,
  X,
  Film,
  Tv,
  Clock,
  Sparkles,
} from 'lucide-react';

interface RecentMediaProps {
  items: RecentMediaItem[];
  activeUrl?: string;
  onSelectMedia: (url: string) => void;
  onRemoveItem: (id: string) => void;
  onClearHistory: () => void;
  compact?: boolean;
}

export const RecentMedia: React.FC<RecentMediaProps> = ({
  items,
  activeUrl,
  onSelectMedia,
  onRemoveItem,
  onClearHistory,
  compact = false,
}) => {
  const [failedThumbnails, setFailedThumbnails] = useState<
    Record<string, boolean>
  >({});
  const [showSamplePresets, setShowSamplePresets] = useState<boolean>(false);

  if (items.length === 0 || showSamplePresets) {
    return (
      <section id="recent-media" className="w-full max-w-5xl mx-auto mt-10">
        {items.length > 0 && showSamplePresets && (
          <div className="flex items-center justify-end mb-3">
            <button
              type="button"
              onClick={() => setShowSamplePresets(false)}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              &larr; Back to Recent Media ({items.length})
            </button>
          </div>
        )}
        <EmptyState
          onSelectPresetUrl={(url) => {
            setShowSamplePresets(false);
            onSelectMedia(url);
          }}
        />
      </section>
    );
  }

  return (
    <section
      id="recent-media"
      aria-label="Recently opened media"
      className="w-full max-w-5xl mx-auto mt-10"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 mb-5 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Saved locally on this device · No credentials or cookies stored</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Recently Opened Media
          </h2>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setShowSamplePresets(true)}
            className="px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Sample Streams</span>
          </button>

          <button
            type="button"
            onClick={onClearHistory}
            className="px-3 py-1.5 text-xs font-medium text-neutral-400 hover:text-rose-400 bg-white/[0.03] hover:bg-rose-500/10 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      <div
        className={`grid grid-cols-1 ${
          compact ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3'
        } gap-4`}
      >
        {items.map((item) => {
          const isCurrent = activeUrl === item.originalUrl;
          const thumbFailed = failedThumbnails[item.id];

          return (
            <article
              key={item.id}
              onClick={() => onSelectMedia(item.originalUrl)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectMedia(item.originalUrl);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Play ${item.title}`}
              className={`group relative rounded-xl border overflow-hidden transition-all duration-200 cursor-pointer flex flex-col justify-between text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isCurrent
                  ? 'bg-[#191923] border-indigo-500/60 ring-1 ring-indigo-500/30 shadow-lg'
                  : 'bg-[#121218]/90 hover:bg-[#17171f] border-white/[0.08] hover:border-white/[0.16]'
              }`}
            >
              {/* Remove single item button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveItem(item.id);
                }}
                aria-label={`Remove ${item.title} from history`}
                title="Remove from history"
                className="absolute top-2.5 right-2.5 z-20 p-1.5 rounded-lg bg-black/70 text-neutral-400 hover:text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div>
                {/* 16:9 Thumbnail or Resilient Fallback */}
                <div className="relative w-full aspect-video bg-[#0b0b0f] overflow-hidden border-b border-white/[0.06] flex items-center justify-center">
                  {item.thumbnailUrl && !thumbFailed ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title || 'Media thumbnail'}
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setFailedThumbnails((prev) => ({
                          ...prev,
                          [item.id]: true,
                        }))
                      }
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex flex-col items-center justify-center p-4 text-neutral-400"
                      style={{
                        background:
                          'radial-gradient(circle at 50% 40%, rgba(99, 102, 241, 0.16), transparent 75%)',
                      }}
                    >
                      {item.provider === 'direct' ? (
                        <Film className="w-7 h-7 text-emerald-400/80 mb-1" />
                      ) : (
                        <Tv className="w-7 h-7 text-indigo-400/80 mb-1" />
                      )}
                      <span className="text-[11px] font-mono text-neutral-400">
                        {item.providerName}
                      </span>
                    </div>
                  )}

                  {/* Measured contrast scrim + play icon */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex items-center justify-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200 ${
                        isCurrent
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white/95 text-neutral-950'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </div>
                  </div>

                  {isCurrent && (
                    <div className="absolute bottom-2 left-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-indigo-300">
                      Active in Player
                    </div>
                  )}
                </div>

                {/* Card Metadata */}
                <div className="p-3.5">
                  <div className="mb-1">
                    <PlatformBadge
                      provider={item.provider}
                      label={item.providerName}
                      size="sm"
                    />
                  </div>

                  <h3 className="text-sm font-semibold text-white line-clamp-1 group-hover:text-indigo-300 transition-colors">
                    {item.title || 'Untitled Stream'}
                  </h3>
                </div>
              </div>

              {/* Footer line */}
              <div className="px-3.5 py-2.5 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-neutral-400">
                <span className="font-medium text-neutral-300">
                  {isCurrent ? 'Playing now' : 'Click to play'}
                </span>
                <span className="font-mono tabular-nums text-neutral-500">
                  {item.lastPlayedAt}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
