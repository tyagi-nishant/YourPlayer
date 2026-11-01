import React from 'react';
import { ResolvedMedia } from '../types';
import { PlatformBadge } from './PlatformBadge';
import {
  ShieldAlert,
  ExternalLink,
  ArrowLeft,
  Link2,
  CheckCircle2,
} from 'lucide-react';

interface UnsupportedProviderMessageProps {
  media: ResolvedMedia;
  onBackHome: () => void;
  onPlayAnother: () => void;
  onSelectSampleUrl?: (url: string) => void;
}

export const UnsupportedProviderMessage: React.FC<
  UnsupportedProviderMessageProps
> = ({ media, onBackHome, onPlayAnother, onSelectSampleUrl }) => {
  const isNetflix = media.provider === 'netflix' || media.status === 'embed_blocked';

  return (
    <div className="w-full max-w-3xl mx-auto my-6 rounded-2xl bg-[#121217] border border-white/[0.09] p-6 sm:p-10 shadow-2xl">
      <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-white/[0.07]">
        <PlatformBadge
          provider={media.provider}
          label={media.providerName}
          subtitle={isNetflix ? 'DRM Protected Platform' : 'Unrecognized Domain'}
        />

        <button
          type="button"
          onClick={onBackHome}
          className="text-xs font-medium text-neutral-400 hover:text-white transition-colors inline-flex items-center gap-1.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded px-2 py-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>
      </div>

      <div className="py-8">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center mb-5">
          <ShieldAlert className="w-6 h-6 text-amber-400" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3 text-balance">
          {isNetflix
            ? 'Netflix titles cannot be embedded in third-party players'
            : `Embedding is not available for ${media.providerName}`}
        </h2>

        <p className="text-sm sm:text-base text-neutral-300 leading-relaxed mb-6 max-w-2xl">
          {media.reason ||
            'This provider does not offer a public iframe embed player or restricts third-party playback via Content-Security-Policy and DRM headers.'}
        </p>

        {/* Submitted URL Reference Box */}
        <div className="p-4 rounded-xl bg-black/50 border border-white/[0.06] mb-8">
          <div className="text-xs text-neutral-500 mb-1 font-medium">
            Submitted URL
          </div>
          <div className="text-xs sm:text-sm font-mono text-neutral-300 break-all">
            {media.originalUrl}
          </div>
        </div>

        {/* Supported Guidelines */}
        <div className="space-y-2.5 text-xs sm:text-sm text-neutral-400 mb-8">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-neutral-200">Official Embeds Supported:</strong>{' '}
              YouTube videos, YouTube Shorts, Vimeo, and Dailymotion links play directly inside PlaySpace.
            </span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-neutral-200">Direct Media Streams:</strong>{' '}
              Publicly accessible HTTPS <code className="font-mono text-neutral-300">.mp4</code> and{' '}
              <code className="font-mono text-neutral-300">.webm</code> video files play via native HTML5 video.
            </span>
          </div>
        </div>

        {/* Primary & Secondary Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {media.externalActionUrl && (
            <a
              href={media.externalActionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors inline-flex items-center gap-2 shadow-lg shadow-indigo-600/20 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <span>
                {isNetflix
                  ? 'Open Title on Netflix.com'
                  : `Open on ${media.providerName}`}
              </span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          <button
            type="button"
            onClick={onPlayAnother}
            className="px-5 py-3 text-xs sm:text-sm font-semibold text-neutral-200 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] rounded-xl transition-colors inline-flex items-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Link2 className="w-4 h-4" />
            <span>Play Another Link</span>
          </button>

          {onSelectSampleUrl && (
            <button
              type="button"
              onClick={() =>
                onSelectSampleUrl('https://www.youtube.com/watch?v=aqz-KE-bpKQ')
              }
              className="px-4 py-3 text-xs sm:text-sm font-medium text-neutral-400 hover:text-white transition-colors whitespace-nowrap"
            >
              Try Sample 4K YouTube Stream
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
