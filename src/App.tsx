import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  InternalEndpointItem,
  InternalEndpointResolveResponse,
  ResolvedMedia,
  RecentMediaItem,
  TmdbMovie,
} from './types';
import {
  resolveMediaUrl,
  extractUrlsFromInput,
  fetchPublicMediaMetadata,
  createTrailerMediaForMovie,
} from './components/MediaResolver';
import { AppHeader, DiscoveryCategoryTab } from './components/AppHeader';
import { UrlInput } from './components/UrlInput';
import { MediaPlayer } from './components/MediaPlayer';
import { RecentMedia } from './components/RecentMedia';
import { MovieDiscoveryHub } from './components/MovieDiscoveryHub';
import { InternalEndpointsHub } from './components/InternalEndpointsHub';
import { PlatformBadge } from './components/PlatformBadge';
import { Play, X, Film, Server } from 'lucide-react';

const STORAGE_KEY = 'playspace_recent_media_v2';
const MAX_HISTORY_ITEMS = 9;

function loadRecentHistory(): RecentMediaItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item: RecentMediaItem) =>
          item &&
          item.provider !== 'internal' &&
          !String(item.originalUrl || '').startsWith('internal://')
      )
      .slice(0, MAX_HISTORY_ITEMS);
  } catch {
    return [];
  }
}

function saveRecentHistory(items: RecentMediaItem[]) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items.slice(0, MAX_HISTORY_ITEMS))
    );
  } catch {
    // Ignore storage quota errors
  }
}

export default function App() {
  const [currentView, setCurrentView] = useState<
    'home' | 'internal' | 'player'
  >('home');
  const [activeCategory, setActiveCategory] =
    useState<DiscoveryCategoryTab>('all');
  const [urlInput, setUrlInput] = useState<string>('');
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Environment-configured Internal Endpoints state (fetched strictly from server)
  const [internalEndpoints, setInternalEndpoints] = useState<
    InternalEndpointItem[]
  >([]);
  const [isLoadingInternalEndpoints, setIsLoadingInternalEndpoints] =
    useState<boolean>(true);

  // Optional TMDB movie that the user is attaching a custom URL to
  const [targetMovieForCustomUrl, setTargetMovieForCustomUrl] =
    useState<TmdbMovie | null>(null);

  const [activeMedia, setActiveMedia] = useState<ResolvedMedia | null>(null);
  const [activeSimilarMovies, setActiveSimilarMovies] = useState<TmdbMovie[]>(
    []
  );
  const [showPlayerUrlSwitcher, setShowPlayerUrlSwitcher] =
    useState<boolean>(false);
  const [recentItems, setRecentItems] = useState<RecentMediaItem[]>(() =>
    loadRecentHistory()
  );

  const homeInputRef = useRef<HTMLInputElement | null>(null);
  const playerSwitcherInputRef = useRef<HTMLInputElement | null>(null);

  const fetchInternalEndpoints = useCallback(async () => {
    setIsLoadingInternalEndpoints(true);
    try {
      const resp = await fetch('/api/internal-endpoints', {
        cache: 'no-store',
      });
      if (resp.ok) {
        const data = await resp.json();
        const nextList: InternalEndpointItem[] = Array.isArray(data.endpoints)
          ? data.endpoints
          : [];
        setInternalEndpoints(nextList);

        // If an internal endpoint was removed from environment variables while active, revoke active session
        setActiveMedia((prev) => {
          if (prev?.provider === 'internal' && prev.internalEndpointId) {
            const stillExists = nextList.some(
              (ep) => ep.id === prev.internalEndpointId
            );
            if (!stillExists) {
              return null;
            }
          }
          return prev;
        });
      }
    } catch {
      // Ignore network hiccup
    } finally {
      setIsLoadingInternalEndpoints(false);
    }
  }, []);

  useEffect(() => {
    fetchInternalEndpoints();
  }, [fetchInternalEndpoints]);

  useEffect(() => {
    saveRecentHistory(recentItems);
  }, [recentItems]);

  const upsertRecentMedia = (media: ResolvedMedia) => {
    if (media.status !== 'playable') return;
    // Never persist temporary local blob:// URLs or server-configured internal endpoints in localStorage
    if (
      media.originalUrl.startsWith('blob:') ||
      media.provider === 'internal' ||
      media.originalUrl.startsWith('internal://')
    ) {
      return;
    }

    const timestamp = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newItem: RecentMediaItem = {
      id: media.mediaId || media.normalizedUrl,
      originalUrl: media.originalUrl,
      provider: media.provider,
      providerName: media.providerName,
      mediaId: media.mediaId,
      title: media.title,
      thumbnailUrl:
        media.tmdbMovie?.backdropUrl ||
        media.tmdbMovie?.posterUrl ||
        media.thumbnailUrl,
      embedUrl: media.embedUrl,
      directVideoUrl: media.directVideoUrl,
      hlsUrl: media.hlsUrl,
      status: media.status,
      lastPlayedAt: timestamp,
    };

    setRecentItems((prev) => {
      const filtered = prev.filter(
        (item) =>
          item.originalUrl !== media.originalUrl &&
          (media.mediaId ? item.mediaId !== media.mediaId : true)
      );
      return [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    });
  };

  // Load similar recommendations for a TMDB movie when playing its trailer or custom stream
  const fetchSimilarForActiveMovie = async (movie: TmdbMovie) => {
    try {
      const resp = await fetch(
        `/api/tmdb/movie/${encodeURIComponent(movie.id)}`
      );
      if (resp.ok) {
        const data = await resp.json();
        if (Array.isArray(data.recommendations)) {
          setActiveSimilarMovies(data.recommendations);
          return;
        }
      }
    } catch {
      // Ignore
    }
    setActiveSimilarMovies([]);
  };

  // Watch Official YouTube Trailer for a TMDB Movie
  const handleWatchMovieTrailer = async (movie: TmdbMovie) => {
    setValidationError(null);
    setIsValidating(true);

    let trailerId = movie.youtubeTrailerId;
    if (!trailerId) {
      try {
        const params = new URLSearchParams({
          title: movie.title,
          year: movie.year || '',
        });
        const resp = await fetch(`/api/tmdb/trailer?${params.toString()}`);
        if (resp.ok) {
          const data = await resp.json();
          if (data.youtubeTrailerId) {
            trailerId = data.youtubeTrailerId;
          }
        }
      } catch {
        // Fallback handled in createTrailerMediaForMovie
      }
    }

    const trailerMedia = createTrailerMediaForMovie(movie, trailerId);
    setIsValidating(false);
    setActiveMedia(trailerMedia);
    setUrlInput(trailerMedia.originalUrl);
    setShowPlayerUrlSwitcher(false);
    setCurrentView('player');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    upsertRecentMedia(trailerMedia);
    fetchSimilarForActiveMovie(movie);
  };

  // Resolve and Play a User-Provided URL (YouTube, HLS .m3u8, MP4, Vimeo)
  const handleResolveAndPlay = (
    rawUrl: string,
    useCorsProxy = false,
    explicitMovie?: TmdbMovie
  ) => {
    setValidationError(null);
    setIsValidating(true);

    const movieContext = explicitMovie || targetMovieForCustomUrl || undefined;

    setTimeout(async () => {
      const candidateUrls = extractUrlsFromInput(rawUrl);
      const primaryRaw = candidateUrls[0] || rawUrl;
      const resolved = resolveMediaUrl(primaryRaw, movieContext, useCorsProxy);
      setIsValidating(false);

      if (resolved.status === 'invalid_url') {
        setValidationError(
          resolved.errorMessage ||
            'Please paste a valid HTTPS video URL (YouTube, .m3u8 HLS stream, .mp4 direct link, or Vimeo).'
        );
        return;
      }

      if (candidateUrls.length > 1) {
        for (let i = candidateUrls.length - 1; i >= 1; i--) {
          const extraResolved = resolveMediaUrl(
            candidateUrls[i],
            undefined,
            useCorsProxy
          );
          if (extraResolved.status === 'playable') {
            upsertRecentMedia(extraResolved);
          }
        }
      }

      setUrlInput(primaryRaw.trim());
      setActiveMedia(resolved);
      setTargetMovieForCustomUrl(null);
      setShowPlayerUrlSwitcher(false);
      setCurrentView('player');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (movieContext) {
        fetchSimilarForActiveMovie(movieContext);
      } else {
        setActiveSimilarMovies([]);
      }

      if (resolved.status === 'playable') {
        upsertRecentMedia(resolved);

        if (!movieContext) {
          const meta = await fetchPublicMediaMetadata(resolved);
          if (meta) {
            setActiveMedia((current) => {
              if (!current || current.originalUrl !== resolved.originalUrl) {
                return current;
              }
              const enriched: ResolvedMedia = {
                ...current,
                title: meta.title || current.title,
                subtitle: meta.subtitle || current.subtitle,
                thumbnailUrl: meta.thumbnailUrl || current.thumbnailUrl,
              };
              upsertRecentMedia(enriched);
              return enriched;
            });
          }
        }
      }
    }, 100);
  };

  // Play a local video file (.mp4, .webm, .mkv) uploaded from the user's device
  const handlePlayLocalVideoFile = (
    blobUrl: string,
    fileName: string,
    attachedMovie?: TmdbMovie
  ) => {
    const cleanFileTitle = fileName.replace(/\.(mp4|webm|mkv|mov|ogg)$/i, '');
    const movieContext =
      attachedMovie || targetMovieForCustomUrl || undefined;

    const localMedia: ResolvedMedia = {
      status: 'playable',
      provider: 'local_file',
      providerName: 'Local Video File',
      originalUrl: blobUrl,
      normalizedUrl: blobUrl,
      directVideoUrl: blobUrl,
      title: movieContext
        ? `${movieContext.title} (${movieContext.year}) — ${cleanFileTitle}`
        : cleanFileTitle,
      subtitle: `${fileName} · Direct Local HTML5 Playback`,
      tmdbMovie: movieContext,
      playbackMode: 'custom_stream',
    };

    setActiveMedia(localMedia);
    setTargetMovieForCustomUrl(null);
    setShowPlayerUrlSwitcher(false);
    setCurrentView('player');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (movieContext) {
      fetchSimilarForActiveMovie(movieContext);
    } else {
      setActiveSimilarMovies([]);
    }
  };

  const handleRemoveRecentItem = (id: string) => {
    setRecentItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearRecentHistory = () => {
    setRecentItems([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  const handleFocusUrlInput = () => {
    if (currentView === 'player') {
      setShowPlayerUrlSwitcher(true);
      setTimeout(() => {
        playerSwitcherInputRef.current?.focus();
        playerSwitcherInputRef.current?.select();
      }, 40);
    } else {
      if (currentView !== 'home') {
        setCurrentView('home');
      }
      setTimeout(() => {
        const studioEl = document.getElementById('custom-url-studio');
        if (studioEl) {
          studioEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        homeInputRef.current?.focus();
        homeInputRef.current?.select();
      }, 100);
    }
  };

  const handleOpenInternalEndpoints = () => {
    setValidationError(null);
    setShowPlayerUrlSwitcher(false);
    setCurrentView('internal');
    fetchInternalEndpoints();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlayInternalMedia = (media: ResolvedMedia) => {
    setValidationError(null);
    setActiveSimilarMovies([]);
    setTargetMovieForCustomUrl(null);
    setShowPlayerUrlSwitcher(false);
    setActiveMedia(media);
    setCurrentView('player');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickSwitchInternalEndpoint = async (
    endpoint: InternalEndpointItem
  ) => {
    try {
      const resp = await fetch(
        `/api/internal-endpoints/${encodeURIComponent(endpoint.id)}/resolve`,
        { cache: 'no-store' }
      );
      if (!resp.ok) {
        await fetchInternalEndpoints();
        setCurrentView('internal');
        return;
      }
      const data: InternalEndpointResolveResponse = await resp.json();
      if (!data.reachable) {
        setCurrentView('internal');
        return;
      }
      if (data.catalogItems && data.catalogItems.length > 1) {
        setCurrentView('internal');
        return;
      }
      if (data.media) {
        handlePlayInternalMedia(data.media);
      }
    } catch {
      setCurrentView('internal');
    }
  };

  return (
    <div
      id="top"
      className="min-h-screen flex flex-col bg-[#08080c] text-neutral-100 font-sans selection:bg-amber-400 selection:text-neutral-950 relative overflow-x-hidden"
    >
      {/* Subtle Ambient Cinema Backlight */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none -z-10 overflow-hidden"
      >
        <div
          className="absolute -top-48 left-1/2 -translate-x-1/2 w-[960px] h-[460px] rounded-full opacity-25 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(245, 158, 11, 0.22) 0%, rgba(99, 102, 241, 0.14) 48%, transparent 74%)',
          }}
        />
      </div>

      {/* Top Navigation Bar (Strict 3-Zone Contract) */}
      <AppHeader
        currentView={currentView}
        activeCategory={activeCategory}
        hasActiveMedia={Boolean(activeMedia)}
        internalEndpointsCount={internalEndpoints.length}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          if (currentView !== 'home') {
            setCurrentView('home');
          }
          setValidationError(null);
        }}
        onOpenInternalEndpoints={handleOpenInternalEndpoints}
        onReturnToPlayer={() => {
          if (activeMedia) {
            setCurrentView('player');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        onFocusUrlInput={handleFocusUrlInput}
      />

      {/* Main Content Stage */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {currentView === 'internal' ? (
          <div className="space-y-8 transition-opacity duration-200">
            {activeMedia && (
              <div className="max-w-6xl mx-auto p-3.5 rounded-2xl bg-[#12131b] border border-amber-400/30 flex items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-3 min-w-0">
                  <PlatformBadge
                    provider={activeMedia.provider}
                    label={activeMedia.providerName}
                    size="sm"
                  />
                  <span className="text-xs sm:text-sm font-semibold text-neutral-200 truncate">
                    {activeMedia.title}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentView('player')}
                  className="px-4 py-1.5 text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Return to Player</span>
                </button>
              </div>
            )}

            <InternalEndpointsHub
              endpoints={internalEndpoints}
              isLoading={isLoadingInternalEndpoints}
              activeEndpointId={
                activeMedia?.provider === 'internal'
                  ? activeMedia.internalEndpointId
                  : undefined
              }
              onRefresh={fetchInternalEndpoints}
              onPlayResolvedMedia={handlePlayInternalMedia}
              onBackToDiscover={() => {
                setCurrentView('home');
                setValidationError(null);
              }}
            />
          </div>
        ) : currentView === 'home' ? (
          <div className="space-y-14 transition-opacity duration-200">
            {/* Resume Active Session Banner when on Home View */}
            {activeMedia && (
              <div className="max-w-4xl mx-auto p-3.5 rounded-2xl bg-[#12131b] border border-amber-400/30 flex items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-3 min-w-0">
                  <PlatformBadge
                    provider={activeMedia.provider}
                    label={activeMedia.providerName}
                    size="sm"
                  />
                  <span className="text-xs sm:text-sm font-semibold text-neutral-200 truncate">
                    {activeMedia.title}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentView('player')}
                  className="px-4 py-1.5 text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Return to Player</span>
                </button>
              </div>
            )}

            {/* Section 1: Universal Custom URL & File Stream Player Studio */}
            <section
              id="custom-url-studio"
              aria-label="Universal Stream URL Player"
              className="text-center max-w-4xl mx-auto pt-2 pb-4"
            >
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 mb-3">
                <span>Universal Cinema Player</span>
                <span aria-hidden="true" className="text-neutral-600">
                  ·
                </span>
                <span className="text-neutral-300">
                  TMDB Discovery &amp; YouTube Trailers
                </span>
              </div>

              <h1
                className="font-extrabold tracking-tight text-white text-balance mb-3.5"
                style={{
                  fontSize: 'clamp(2.25rem, 4.5vw, 3.75rem)',
                  lineHeight: 1.06,
                }}
              >
                Your streams. Official trailers. One theatre.
              </h1>

              <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed mb-6">
                Explore upcoming movies, high-resolution posters, and tailored
                recommendations powered by TMDB, watch official trailers via
                YouTube, paste a custom stream URL, or switch to
                environment-configured internal endpoints.
              </p>

              {/* Workspace Stream Source Switcher (Public URL & File vs Internal Env Endpoints) */}
              <div className="inline-flex items-center gap-1 p-1 mb-6 rounded-xl bg-[#111218] border border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => homeInputRef.current?.focus()}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-400 text-neutral-950 transition-colors whitespace-nowrap shrink-0"
                >
                  Public URL &amp; Local File
                </button>
                <button
                  type="button"
                  onClick={handleOpenInternalEndpoints}
                  className="px-4 py-2 text-xs font-medium rounded-lg text-neutral-300 hover:text-white hover:bg-white/[0.05] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 tabular-nums"
                >
                  <Server className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {internalEndpoints.length > 0
                      ? `Internal Endpoints (${internalEndpoints.length})`
                      : 'Internal Endpoints'}
                  </span>
                </button>
              </div>

              {/* Context Banner if user selected a TMDB movie to attach a custom URL to */}
              {targetMovieForCustomUrl && (
                <div className="max-w-2xl mx-auto mb-4 px-4 py-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-between gap-3 text-xs text-amber-200">
                  <div className="flex items-center gap-2 truncate">
                    <Film className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">
                      Attaching custom stream URL or file to:{' '}
                      <strong className="text-white">
                        {targetMovieForCustomUrl.title} (
                        {targetMovieForCustomUrl.year})
                      </strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTargetMovieForCustomUrl(null)}
                    className="text-neutral-400 hover:text-white shrink-0"
                    aria-label="Cancel movie attachment"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <UrlInput
                inputRef={homeInputRef}
                value={urlInput}
                onChange={setUrlInput}
                onSubmit={(url, useProxy) =>
                  handleResolveAndPlay(url, useProxy)
                }
                onUploadLocalVideo={(blobUrl, fileName) =>
                  handlePlayLocalVideoFile(blobUrl, fileName)
                }
                isValidating={isValidating}
                validationError={validationError}
                onClearError={() => setValidationError(null)}
                attachedMovieTitle={targetMovieForCustomUrl?.title}
              />
            </section>

            {/* Section 2: TMDB Movie Discovery, Posters, Upcoming Movies, Recommendations & Trailers */}
            <MovieDiscoveryHub
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              onWatchTrailer={handleWatchMovieTrailer}
              onOpenCustomStreamForMovie={(movie, customUrl) => {
                if (customUrl) {
                  handleResolveAndPlay(customUrl, false, movie);
                } else {
                  setTargetMovieForCustomUrl(movie);
                  handleFocusUrlInput();
                }
              }}
              onUploadLocalVideoForMovie={(movie, blobUrl, fileName) => {
                handlePlayLocalVideoFile(blobUrl, fileName, movie);
              }}
            />

            {/* Section 3: Recent Custom Streams & Trailers History (Only if user has played items) */}
            {recentItems.length > 0 && (
              <RecentMedia
                items={recentItems}
                activeUrl={activeMedia?.originalUrl}
                onSelectMedia={(url) => {
                  setUrlInput(url);
                  handleResolveAndPlay(url);
                }}
                onRemoveItem={handleRemoveRecentItem}
                onClearHistory={handleClearRecentHistory}
              />
            )}
          </div>
        ) : (
          /* Immersive Player View */
          <div className="transition-opacity duration-200">
            {/* Inline "Load Another URL" Bar when toggled inside Player View */}
            {showPlayerUrlSwitcher && (
              <div className="max-w-5xl mx-auto mb-8 p-5 rounded-2xl bg-[#111218] border border-white/[0.1] shadow-2xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    Load Custom Stream URL or Local File
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPlayerUrlSwitcher(false);
                      setValidationError(null);
                    }}
                    className="p-1 text-neutral-400 hover:text-white rounded-lg transition-colors"
                    aria-label="Close URL switcher"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <UrlInput
                  inputRef={playerSwitcherInputRef}
                  value={urlInput}
                  onChange={setUrlInput}
                  onSubmit={(url, useProxy) =>
                    handleResolveAndPlay(url, useProxy)
                  }
                  onUploadLocalVideo={(blobUrl, fileName) =>
                    handlePlayLocalVideoFile(blobUrl, fileName)
                  }
                  isValidating={isValidating}
                  validationError={validationError}
                  onClearError={() => setValidationError(null)}
                  compact
                />
              </div>
            )}

            {/* Active Media Player Stage */}
            {activeMedia && (
              <MediaPlayer
                media={activeMedia}
                similarMovies={activeSimilarMovies}
                internalEndpoints={internalEndpoints}
                onBackHome={() => {
                  setCurrentView('home');
                  setValidationError(null);
                }}
                onOpenInternalEndpoints={handleOpenInternalEndpoints}
                onSelectInternalEndpoint={handleQuickSwitchInternalEndpoint}
                onPlayAnother={() => {
                  setShowPlayerUrlSwitcher(true);
                  setTimeout(() => {
                    playerSwitcherInputRef.current?.focus();
                    playerSwitcherInputRef.current?.select();
                  }, 50);
                }}
                onSelectSampleUrl={(sampleUrl) => {
                  setUrlInput(sampleUrl);
                  handleResolveAndPlay(sampleUrl);
                }}
                onWatchMovieTrailer={handleWatchMovieTrailer}
                onAttachCustomUrlToMovie={(movie, rawUrl) => {
                  handleResolveAndPlay(rawUrl, false, movie);
                }}
                onUploadLocalFileForMovie={(movie, blobUrl, fileName) => {
                  handlePlayLocalVideoFile(blobUrl, fileName, movie);
                }}
              />
            )}

            {/* Compact Recent History Section below Player (only if user has recent items) */}
            {recentItems.length > 0 && (
              <div className="mt-12">
                <RecentMedia
                  items={recentItems}
                  activeUrl={activeMedia?.originalUrl}
                  onSelectMedia={(url) => {
                    setUrlInput(url);
                    handleResolveAndPlay(url);
                  }}
                  onRemoveItem={handleRemoveRecentItem}
                  onClearHistory={handleClearRecentHistory}
                  compact
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="mt-auto border-t border-white/[0.06] bg-[#060609] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-300">PlaySpace</span>
            <span aria-hidden="true">·</span>
            <span>
              TMDB Cinema Discovery, Official YouTube Trailers &amp; Universal URL
              Player
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span>Bring Your Own URL or File</span>
            <span aria-hidden="true">·</span>
            <span>Official YouTube Trailer Embeds</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
