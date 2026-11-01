import React from 'react';
import { ProviderType } from '../types';
import {
  Tv,
  Film,
  Video,
  Globe,
  ShieldAlert,
  PlaySquare,
  Compass,
  HardDrive,
  Radio,
} from 'lucide-react';

interface PlatformBadgeProps {
  provider: ProviderType;
  label?: string;
  subtitle?: string;
  size?: 'sm' | 'md';
}

/**
 * Renders clean, unboxed platform metadata with subtle typographic separators.
 */
export const PlatformBadge: React.FC<PlatformBadgeProps> = ({
  provider,
  label,
  subtitle,
  size = 'md',
}) => {
  const getProviderIcon = () => {
    const iconClass =
      size === 'sm' ? 'w-3.5 h-3.5 shrink-0' : 'w-4 h-4 shrink-0';
    switch (provider) {
      case 'youtube':
        return <PlaySquare className={`${iconClass} text-rose-500`} />;
      case 'hls':
        return <Radio className={`${iconClass} text-amber-400`} />;
      case 'local_file':
        return <HardDrive className={`${iconClass} text-emerald-400`} />;
      case 'vimeo':
        return <Tv className={`${iconClass} text-sky-400`} />;
      case 'direct':
        return <Film className={`${iconClass} text-emerald-400`} />;
      case 'dailymotion':
      case 'streamable':
      case 'archive':
        return <Video className={`${iconClass} text-indigo-400`} />;
      case 'web_embed':
        return <Compass className={`${iconClass} text-violet-400`} />;
      case 'netflix':
        return <ShieldAlert className={`${iconClass} text-amber-400`} />;
      default:
        return <Globe className={`${iconClass} text-neutral-400`} />;
    }
  };

  const displayName =
    label ||
    (provider === 'youtube'
      ? 'YouTube'
      : provider === 'hls'
      ? 'HLS Adaptive Stream'
      : provider === 'local_file'
      ? 'Local Video File'
      : provider === 'vimeo'
      ? 'Vimeo'
      : provider === 'direct'
      ? 'Direct HTML5 Video'
      : provider === 'dailymotion'
      ? 'Dailymotion'
      : provider === 'streamable'
      ? 'Streamable'
      : provider === 'archive'
      ? 'Internet Archive'
      : provider === 'web_embed'
      ? 'Custom Embed'
      : provider === 'netflix'
      ? 'Netflix'
      : 'External Source');

  return (
    <div
      className={`inline-flex items-center gap-2 ${
        size === 'sm' ? 'text-xs' : 'text-xs sm:text-sm'
      } text-neutral-300 font-medium`}
    >
      {getProviderIcon()}
      <span className="text-neutral-200 font-semibold tracking-tight">
        {displayName}
      </span>
      {subtitle && (
        <>
          <span aria-hidden="true" className="text-neutral-600">
            ·
          </span>
          <span className="text-neutral-400 font-normal truncate max-w-[260px] sm:max-w-md">
            {subtitle}
          </span>
        </>
      )}
    </div>
  );
};
