import React from 'react';
import { ResolvedMedia } from '../types';
import {
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  Link2,
} from 'lucide-react';

interface PlaybackErrorProps {
  media: ResolvedMedia;
  errorDetails?: string;
  onRetry: () => void;
  onEditUrl: () => void;
}

export const PlaybackError: React.FC<PlaybackErrorProps> = ({
  media,
  errorDetails,
  onRetry,
  onEditUrl,
}) => {
  return (
    <div className="w-full rounded-2xl bg-[#121217] border border-rose-500/30 p-6 sm:p-10 text-left shadow-2xl">
      <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center mb-5">
        <AlertTriangle className="w-6 h-6 text-rose-400" />
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
        Playback could not be initialized
      </h3>

      <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-2xl mb-6">
        {errorDetails ||
          'The media stream could not be loaded. This can happen if the video file is offline, blocked by Cross-Origin (CORS) rules, private, deleted, or restricted from third-party embedding by the content owner.'}
      </p>

      <div className="p-3.5 rounded-xl bg-black/50 border border-white/[0.06] mb-6">
        <span className="text-xs text-neutral-500 block mb-1">Media Source</span>
        <span className="text-xs font-mono text-neutral-300 break-all">
          {media.originalUrl}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors inline-flex items-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retry Playback</span>
        </button>

        <button
          type="button"
          onClick={onEditUrl}
          className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-neutral-200 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] rounded-xl transition-colors inline-flex items-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <Link2 className="w-4 h-4" />
          <span>Edit or Paste Another Link</span>
        </button>

        {media.externalActionUrl && (
          <a
            href={media.externalActionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 text-xs sm:text-sm font-medium text-neutral-400 hover:text-white transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <span>Open directly on {media.providerName}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
};
