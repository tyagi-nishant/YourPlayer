export type ProviderType =
  | 'youtube'
  | 'vimeo'
  | 'direct'
  | 'hls'
  | 'local_file'
  | 'internal'
  | 'netflix'
  | 'dailymotion'
  | 'twitch'
  | 'streamable'
  | 'archive'
  | 'web_embed'
  | 'unsupported';

export type ResolutionStatus =
  | 'playable'
  | 'embed_blocked'
  | 'unsupported_provider'
  | 'invalid_url';

export interface TmdbMovie {
  id: string;
  tmdbId: number;
  imdbId?: string;
  title: string;
  tagline?: string;
  overview: string;
  releaseDate: string;
  year: string;
  status: 'Released' | 'Upcoming' | 'In Production';
  category: 'recommended' | 'upcoming' | 'trending' | 'top_rated';
  rating: number;
  voteCount: number;
  runtime: string;
  genres: string[];
  director: string;
  cast: string[];
  posterUrl: string;
  backdropUrl: string;
  posterGallery: string[];
  youtubeTrailerId: string;
  featured?: boolean;
}

export interface InternalEndpointItem {
  id: string;
  name: string;
  envKey: string;
  maskedTarget: string;
  protocolHint:
    | 'hls'
    | 'direct'
    | 'audio'
    | 'embed'
    | 'json'
    | 'm3u'
    | 'youtube'
    | 'vimeo'
    | 'auto';
  protocolLabel: string;
  group?: string;
}

export interface InternalCatalogStreamItem {
  id: string;
  title: string;
  subtitle?: string;
  media: ResolvedMedia;
}

export interface InternalEndpointResolveResponse {
  id: string;
  name: string;
  envKey: string;
  reachable: boolean;
  httpStatus?: number;
  contentType?: string;
  resolvedKind?: 'hls' | 'direct' | 'audio' | 'embed' | 'catalog';
  resolvedLabel?: string;
  media?: ResolvedMedia;
  catalogItems?: InternalCatalogStreamItem[];
  error?: string;
}

export interface ResolvedMedia {
  status: ResolutionStatus;
  provider: ProviderType;
  providerName: string;
  originalUrl: string;
  normalizedUrl: string;
  mediaId?: string;
  embedUrl?: string;
  directVideoUrl?: string;
  hlsUrl?: string;
  title: string;
  subtitle?: string;
  thumbnailUrl?: string;
  isShort?: boolean;
  isWebPortal?: boolean;
  portalSearchQuery?: string;
  imdbId?: string;
  tmdbMovie?: TmdbMovie;
  playbackMode?: 'trailer' | 'custom_stream' | 'internal_endpoint';
  mediaKind?: 'video' | 'audio';
  internalEndpointId?: string;
  initialSubtitles?: SubtitleTrackOption[];
  errorMessage?: string;
  reason?: string;
  externalActionUrl?: string;
}

export interface CatalogItem {
  imdbId: string;
  tmdbId?: string;
  watchUrl?: string;
  title: string;
  year: string;
  type: 'movie' | 'series';
  poster?: string;
  description?: string;
}

export interface SubtitleTrackOption {
  id: string;
  label: string;
  lang: string;
  url: string;
  isCustom?: boolean;
}

export interface PlayableStreamOption {
  id: string;
  label: string;
  serverName?: string;
  language?: string;
  quality?: string;
  kind: 'hls' | 'embed' | 'youtube' | 'direct_mp4';
  hlsUrl?: string;
  embedUrl?: string;
  directVideoUrl?: string;
  title: string;
  subtitles?: SubtitleTrackOption[];
}

export interface RecentMediaItem {
  id: string;
  originalUrl: string;
  provider: ProviderType;
  providerName: string;
  mediaId?: string;
  title: string;
  thumbnailUrl?: string;
  embedUrl?: string;
  directVideoUrl?: string;
  hlsUrl?: string;
  status: ResolutionStatus;
  lastPlayedAt: string;
}

export interface SampleMediaPreset {
  id: string;
  label: string;
  providerName: string;
  provider: ProviderType;
  url: string;
  description: string;
  thumbnailUrl?: string;
  duration?: string;
}

export type ThemeMode = 'dark' | 'light';
export type PaletteTone = 'indigo' | 'emerald' | 'rose' | 'amber' | string;
export type DiscoveryBooking = Record<string, any>;
export interface ProjectCaseStudy {
  [key: string]: any;
  metrics: any[];
  technologies: string[];
  tags?: string[];
}
export type ProjectEstimateConfig = Record<string, any>;
export interface MediaItem {
  [key: string]: any;
  chapters?: any[];
}
export type ToastMessage = Record<string, any>;
export interface StudioService {
  [key: string]: any;
  capabilities: string[];
  outcomes: string[];
  technologies: string[];
}

