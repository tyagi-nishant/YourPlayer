import React, { useState } from 'react';
import { SAMPLE_MEDIA_PRESETS } from './MediaResolver';
import { PlatformBadge } from './PlatformBadge';
import { Play, Film, Tv } from 'lucide-react';

interface EmptyStateProps {
  onSelectPresetUrl: (url: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onSelectPresetUrl,
}) => {
  const [failedThumbs, setFailedThumbs] = useState<Record<string, boolean>>({});

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="rounded-2xl bg-[#111116]/75 border border-white/[0.07] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 mb-6 border-b border-white/[0.06]">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Instant Try-Out Streams
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              No recent history yet. Paste your own link above, or select a verified stream below to test PlaySpace immediately.
            </p>
          </div>
          <span className="text-xs text-neutral-500 font-mono tabular-nums shrink-0">
            6 Verified Sources
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SAMPLE_MEDIA_PRESETS.map((preset) => {
            const thumbFailed = failedThumbs[preset.id];
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPresetUrl(preset.url)}
                className="group text-left rounded-xl bg-[#16161d] hover:bg-[#1c1c25] border border-white/[0.07] hover:border-white/[0.16] overflow-hidden transition-all duration-200 flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                {/* 16:9 Thumbnail or Stylized Vector Fallback */}
                <div className="relative w-full aspect-video bg-[#0b0b0f] overflow-hidden border-b border-white/[0.06] flex items-center justify-center">
                  {preset.thumbnailUrl && !thumbFailed ? (
                    <img
                      src={preset.thumbnailUrl}
                      alt={preset.description}
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setFailedThumbs((prev) => ({
                          ...prev,
                          [preset.id]: true,
                        }))
                      }
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex flex-col items-center justify-center p-4 text-neutral-400"
                      style={{
                        background:
                          preset.provider === 'netflix'
                            ? 'radial-gradient(circle at 50% 40%, rgba(245, 158, 11, 0.16), transparent 75%)'
                            : preset.provider === 'direct'
                            ? 'radial-gradient(circle at 50% 40%, rgba(16, 185, 129, 0.16), transparent 75%)'
                            : 'radial-gradient(circle at 50% 40%, rgba(56, 189, 248, 0.16), transparent 75%)',
                      }}
                    >
                      {preset.provider === 'direct' ? (
                        <Film className="w-8 h-8 text-emerald-400/80 mb-1.5" />
                      ) : (
                        <Tv className="w-8 h-8 text-neutral-400/80 mb-1.5" />
                      )}
                      <span className="text-[11px] font-mono text-neutral-400">
                        {preset.providerName}
                      </span>
                    </div>
                  )}

                  {/* Measured contrast scrim + play button */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/95 text-neutral-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                  </div>

                  {preset.duration && (
                    <div className="absolute bottom-2.5 right-3 text-[11px] font-mono font-semibold text-white/90 tabular-nums">
                      {preset.duration}
                    </div>
                  )}
                </div>

                {/* Card Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="mb-1.5">
                      <PlatformBadge
                        provider={preset.provider}
                        label={preset.label}
                        size="sm"
                      />
                    </div>
                    <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-indigo-300 transition-colors">
                      {preset.description}
                    </h3>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/[0.06] text-[11px] font-mono text-neutral-500 truncate">
                    {preset.url}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
