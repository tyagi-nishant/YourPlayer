import React, { useState, useEffect, useMemo } from 'react';
import { TmdbMovie } from '../types';
import { DiscoveryCategoryTab } from './AppHeader';
import {
  Play,
  Search,
  Film,
  Calendar,
  Sparkles,
  Link2,
  Image as ImageIcon,
  X,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Upload,
} from 'lucide-react';

interface MovieDiscoveryHubProps {
  activeCategory: DiscoveryCategoryTab;
  onSelectCategory: (cat: DiscoveryCategoryTab) => void;
  onWatchTrailer: (movie: TmdbMovie) => void;
  onOpenCustomStreamForMovie: (movie: TmdbMovie, customUrl?: string) => void;
  onUploadLocalVideoForMovie: (movie: TmdbMovie, blobUrl: string, fileName: string) => void;
}

/**
 * Strictly checks whether a movie is genuinely upcoming in the future.
 * Any movie whose releaseDate is on or before today (or from 2025 or earlier)
 * is treated as Released / Available, never Upcoming.
 */
function isMovieUpcoming(movie: TmdbMovie): boolean {
  const todayIso = new Date().toISOString().slice(0, 10);
  if (movie.releaseDate && movie.releaseDate <= todayIso) {
    return false;
  }
  if (Number(movie.year) <= 2025) {
    return false;
  }
  return movie.status === 'Upcoming' || movie.category === 'upcoming';
}

export const MovieDiscoveryHub: React.FC<MovieDiscoveryHubProps> = ({
  activeCategory,
  onSelectCategory,
  onWatchTrailer,
  onOpenCustomStreamForMovie,
  onUploadLocalVideoForMovie,
}) => {
  const [allMovies, setAllMovies] = useState<TmdbMovie[]>([]);
  const [featuredMovies, setFeaturedMovies] = useState<TmdbMovie[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<TmdbMovie[] | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLoadingFeed, setIsLoadingFeed] = useState<boolean>(true);

  // Hero Spotlight index
  const [heroIndex, setHeroIndex] = useState<number>(0);

  // Selected Movie for Poster Gallery, Details & Similar Recommendations Modal
  const [selectedMovie, setSelectedMovie] = useState<TmdbMovie | null>(null);
  const [similarRecommendations, setSimilarRecommendations] = useState<
    TmdbMovie[]
  >([]);
  const [activePosterIndex, setActivePosterIndex] = useState<number>(0);
  const [customMovieStreamUrl, setCustomMovieStreamUrl] = useState<string>('');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Fetch initial TMDB discovery feeds
  useEffect(() => {
    let cancelled = false;
    setIsLoadingFeed(true);
    fetch('/api/tmdb/discover')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        if (Array.isArray(data.allMovies)) {
          setAllMovies(data.allMovies);
        }
        if (Array.isArray(data.featured) && data.featured.length > 0) {
          setFeaturedMovies(data.featured);
        }
        if (Array.isArray(data.genres)) {
          setGenres(['All', ...data.genres]);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoadingFeed(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-advance Hero Spotlight every 8 seconds unless modal is open
  useEffect(() => {
    if (featuredMovies.length <= 1 || selectedMovie) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [featuredMovies.length, selectedMovie]);

  // Handle TMDB search
  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    try {
      const resp = await fetch(`/api/tmdb/search?q=${encodeURIComponent(q)}`);
      if (resp.ok) {
        const data = await resp.json();
        setSearchResults(Array.isArray(data.results) ? data.results : []);
      }
    } catch {
      // Fallback to local filter
      const qLower = q.toLowerCase();
      setSearchResults(
        allMovies.filter(
          (m) =>
            m.title.toLowerCase().includes(qLower) ||
            m.director.toLowerCase().includes(qLower)
        )
      );
    } finally {
      setIsSearching(false);
    }
  };

  // Open Movie Details, Posters & Recommendations Modal
  const handleInspectMovie = async (movie: TmdbMovie) => {
    setSelectedMovie(movie);
    setActivePosterIndex(0);
    setCustomMovieStreamUrl('');

    // Compute immediate local recommendations by genre/director
    const localRecs = allMovies
      .filter(
        (m) =>
          m.id !== movie.id &&
          (m.genres.some((g) => movie.genres.includes(g)) ||
            m.director === movie.director)
      )
      .slice(0, 6);
    setSimilarRecommendations(localRecs);

    // Also fetch server detail + recommendations if available
    try {
      const resp = await fetch(`/api/tmdb/movie/${encodeURIComponent(movie.id)}`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.movie) {
          setSelectedMovie(data.movie);
        }
        if (Array.isArray(data.recommendations) && data.recommendations.length > 0) {
          setSimilarRecommendations(data.recommendations);
        }
      }
    } catch {
      // Keep local recommendations
    }
  };

  // Filtered movies for the main grid
  const displayedMovies = useMemo(() => {
    const baseList = searchResults !== null ? searchResults : allMovies;

    return baseList.filter((movie) => {
      const upcoming = isMovieUpcoming(movie);
      if (searchResults === null) {
        if (activeCategory === 'recommended') {
          if (upcoming || (movie.category !== 'recommended' && movie.rating < 8.2)) {
            return false;
          }
        } else if (activeCategory === 'upcoming') {
          if (!upcoming) {
            return false;
          }
        } else if (activeCategory === 'trending') {
          if (
            upcoming ||
            (movie.category !== 'trending' &&
              movie.year !== '2024' &&
              movie.year !== '2025' &&
              movie.year !== '2026')
          ) {
            return false;
          }
        } else if (activeCategory === 'top_rated') {
          if (upcoming || movie.rating < 8.0) return false;
        }
      }

      if (selectedGenre !== 'All') {
        if (!movie.genres.includes(selectedGenre)) return false;
      }

      return true;
    });
  }, [allMovies, searchResults, activeCategory, selectedGenre]);

  const upcomingShowcase = useMemo(
    () => allMovies.filter((m) => isMovieUpcoming(m)),
    [allMovies]
  );

  const recommendedShowcase = useMemo(
    () =>
      allMovies.filter(
        (m) => !isMovieUpcoming(m) && (m.category === 'recommended' || m.rating >= 8.3)
      ),
    [allMovies]
  );

  const activeHeroMovie =
    featuredMovies[heroIndex] || allMovies[0] || null;

  return (
    <div className="space-y-14">
      {/* 1. Cinematic TMDB Hero Spotlight */}
      {activeHeroMovie && (
        <section
          aria-label="Featured Movie Spotlight"
          className="relative w-full rounded-3xl overflow-hidden border border-white/[0.09] bg-[#0d0e14] shadow-[0_28px_80px_rgba(0,0,0,0.75)]"
        >
          {/* Backdrop Image with Measured Gradient Scrim */}
          <div className="relative min-h-[420px] sm:min-h-[480px] flex items-end p-6 sm:p-10 lg:p-12">
            {!failedImages[`hero-${activeHeroMovie.id}`] && (
              <img
                src={activeHeroMovie.backdropUrl || activeHeroMovie.posterUrl}
                alt={activeHeroMovie.title}
                referrerPolicy="no-referrer"
                onError={() =>
                  setFailedImages((prev) => ({
                    ...prev,
                    [`hero-${activeHeroMovie.id}`]: true,
                  }))
                }
                className="absolute inset-0 w-full h-full object-cover object-center opacity-45 scale-105 transition-all duration-700"
              />
            )}

            {/* Multi-layer Cinema Contrast Scrim */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[#08080c] via-[#08080c]/80 to-transparent"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-[#08080c] via-[#08080c]/70 to-transparent"
            />

            {/* Spotlight Content */}
            <div className="relative z-10 w-full flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div className="max-w-2xl space-y-3.5">
                {/* Clean Unboxed Kicker & Metadata (Zero-Pill Discipline) */}
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-mono text-amber-400 tracking-wide uppercase">
                  <span>TMDB Spotlight</span>
                  <span aria-hidden="true" className="text-neutral-600">
                    ·
                  </span>
                  <span
                    className={
                      isMovieUpcoming(activeHeroMovie)
                        ? 'text-amber-300'
                        : 'text-emerald-400'
                    }
                  >
                    {isMovieUpcoming(activeHeroMovie)
                      ? `Upcoming Release (${activeHeroMovie.releaseDate})`
                      : `Available Now (${activeHeroMovie.year})`}
                  </span>
                  <span aria-hidden="true" className="text-neutral-600">
                    ·
                  </span>
                  <span className="text-amber-300 tabular-nums">
                    ★ {activeHeroMovie.rating.toFixed(1)}
                  </span>
                  <span aria-hidden="true" className="text-neutral-600">
                    ·
                  </span>
                  <span className="text-neutral-300 tabular-nums">
                    {activeHeroMovie.runtime}
                  </span>
                </div>

                <h2
                  className="font-extrabold text-white tracking-tight text-balance"
                  style={{
                    fontSize: 'clamp(2rem, 4vw, 3.25rem)',
                    lineHeight: 1.08,
                  }}
                >
                  {activeHeroMovie.title}
                </h2>

                <div className="text-xs sm:text-sm text-neutral-300 font-medium">
                  <span>{activeHeroMovie.genres.join(' / ')}</span>
                  <span aria-hidden="true" className="mx-2 text-neutral-600">
                    ·
                  </span>
                  <span className="text-neutral-400">
                    Directed by{' '}
                    <strong className="text-neutral-200 font-semibold">
                      {activeHeroMovie.director}
                    </strong>
                  </span>
                </div>

                <p className="text-sm sm:text-base text-neutral-300/90 line-clamp-3 leading-relaxed max-w-xl">
                  {activeHeroMovie.overview}
                </p>

                {/* Primary & Secondary Actions */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onWatchTrailer(activeHeroMovie)}
                    className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs sm:text-sm inline-flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Watch Official Trailer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInspectMovie(activeHeroMovie)}
                    className="px-4 py-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/[0.12] text-white font-semibold text-xs sm:text-sm inline-flex items-center gap-2 transition-colors"
                  >
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span>Posters &amp; Recommendations</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenCustomStreamForMovie(activeHeroMovie)}
                    className="px-4 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] text-neutral-200 hover:text-white font-medium text-xs sm:text-sm inline-flex items-center gap-2 transition-colors"
                  >
                    <Link2 className="w-4 h-4 text-indigo-400" />
                    <span>Play Custom URL for Movie</span>
                  </button>
                </div>
              </div>

              {/* Right Carousel Controls & Poster Preview */}
              <div className="flex items-center gap-4 self-end">
                <div className="hidden sm:block w-28 aspect-[2/3] rounded-xl overflow-hidden border border-white/[0.15] shadow-2xl shrink-0 bg-black">
                  {!failedImages[`hero-poster-${activeHeroMovie.id}`] && (
                    <img
                      src={activeHeroMovie.posterUrl}
                      alt={`${activeHeroMovie.title} Poster`}
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setFailedImages((prev) => ({
                          ...prev,
                          [`hero-poster-${activeHeroMovie.id}`]: true,
                        }))
                      }
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {featuredMovies.length > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setHeroIndex(
                          (prev) =>
                            (prev - 1 + featuredMovies.length) %
                            featuredMovies.length
                        )
                      }
                      aria-label="Previous spotlight movie"
                      className="p-2.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.15] border border-white/[0.1] text-white transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono tabular-nums text-neutral-400 px-1">
                      {heroIndex + 1} / {featuredMovies.length}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setHeroIndex((prev) => (prev + 1) % featuredMovies.length)
                      }
                      aria-label="Next spotlight movie"
                      className="p-2.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.15] border border-white/[0.1] text-white transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. TMDB Search, Discovery Filter Tabs & Genre Bar */}
      <section id="discover-hub" className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-amber-400 mb-1">
              TMDB Cinema Database · Official YouTube Trailers
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Discover Movies, Posters &amp; Trailers
            </h2>
          </div>

          {/* Live TMDB Movie Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2 w-full lg:w-96"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!e.target.value.trim()) {
                    setSearchResults(null);
                  }
                }}
                placeholder="Search any movie, director, or actor…"
                className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-[#12131a] border border-white/[0.12] text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults(null);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs sm:text-sm transition-colors shrink-0"
            >
              {isSearching ? 'Searching…' : 'Search'}
            </button>
          </form>
        </div>

        {/* Interactive Segmented Category Tabs + Genre Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Segmented Control */}
          <div
            role="tablist"
            aria-label="Movie Discovery Categories"
            className="inline-flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-[#111218] border border-white/[0.07]"
          >
            {(
              [
                { id: 'all', label: 'All Discover' },
                { id: 'recommended', label: 'Recommendations' },
                { id: 'upcoming', label: 'Upcoming Movies' },
                { id: 'trending', label: 'Trending Now' },
                { id: 'top_rated', label: 'Top Rated' },
              ] as const
            ).map((tab) => {
              const active =
                searchResults === null && activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={active}
                  type="button"
                  onClick={() => {
                    setSearchResults(null);
                    setSearchQuery('');
                    onSelectCategory(tab.id);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    active
                      ? 'bg-amber-400 text-neutral-950 shadow-sm'
                      : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Genre Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {genres.slice(0, 8).map((genre) => {
              const isSelected = selectedGenre === genre;
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-white text-neutral-950 font-semibold'
                      : 'bg-white/[0.04] hover:bg-white/[0.09] text-neutral-400 hover:text-white'
                  }`}
                >
                  {genre}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Status Banner */}
        {searchResults !== null && (
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#12131b] border border-white/[0.08] text-xs text-neutral-300">
            <span>
              Showing <strong>{displayedMovies.length}</strong> TMDB results for{' '}
              <strong className="text-amber-400">“{searchQuery}”</strong> — click
              any card to watch its official YouTube trailer, inspect posters, or
              attach a custom stream URL.
            </span>
            <button
              type="button"
              onClick={() => {
                setSearchResults(null);
                setSearchQuery('');
              }}
              className="text-amber-400 hover:text-amber-300 font-semibold ml-4 shrink-0"
            >
              Reset Search
            </button>
          </div>
        )}

        {/* Main TMDB Movie Poster Grid */}
        {isLoadingFeed ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, idx) => (
              <div
                key={idx}
                className="aspect-[2/3] rounded-2xl bg-white/[0.04] animate-pulse border border-white/[0.06]"
              />
            ))}
          </div>
        ) : displayedMovies.length === 0 ? (
          <div className="p-12 rounded-2xl bg-[#111218] border border-white/[0.07] text-center space-y-3">
            <Film className="w-8 h-8 text-amber-400/70 mx-auto" />
            <h3 className="text-base font-bold text-white">
              No matching movies found
            </h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              Try clearing the genre filter or searching for another title,
              director, or actor.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedGenre('All');
                setSearchResults(null);
                setSearchQuery('');
                onSelectCategory('all');
              }}
              className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-xs font-semibold text-white"
            >
              Show All Movies
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {displayedMovies.map((movie) => {
              const posterBroken = failedImages[movie.id];
              return (
                <article
                  key={movie.id}
                  className="group relative rounded-2xl bg-[#101118] border border-white/[0.08] hover:border-amber-400/50 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-lg"
                >
                  {/* High-Res 2:3 Poster Stage */}
                  <div
                    onClick={() => handleInspectMovie(movie)}
                    className="relative w-full aspect-[2/3] bg-[#090a0f] overflow-hidden cursor-pointer flex items-center justify-center"
                  >
                    {!posterBroken ? (
                      <img
                        src={movie.posterUrl}
                        alt={`${movie.title} Poster`}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setFailedImages((prev) => ({
                            ...prev,
                            [movie.id]: true,
                          }))
                        }
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 text-center">
                        <Film className="w-8 h-8 text-amber-400/60 mb-2" />
                        <span className="text-xs font-bold text-white">
                          {movie.title}
                        </span>
                        <span className="text-[11px] font-mono text-neutral-400 mt-1">
                          {movie.year}
                        </span>
                      </div>
                    )}

                    {/* Subtle Gradient Overlay on Hover with Quick Trailer & Poster Actions */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3.5 gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onWatchTrailer(movie);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs inline-flex items-center justify-center gap-1.5 shadow-lg"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Watch Trailer</span>
                      </button>

                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInspectMovie(movie);
                          }}
                          className="py-1.5 px-2 rounded-lg bg-white/15 hover:bg-white/25 text-white font-semibold text-[11px] inline-flex items-center justify-center gap-1 backdrop-blur-md"
                        >
                          <ImageIcon className="w-3 h-3 text-amber-300" />
                          <span>Posters</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenCustomStreamForMovie(movie);
                          }}
                          className="py-1.5 px-2 rounded-lg bg-white/15 hover:bg-white/25 text-white font-semibold text-[11px] inline-flex items-center justify-center gap-1 backdrop-blur-md"
                          title="Paste custom stream URL for this movie"
                        >
                          <Link2 className="w-3 h-3 text-indigo-300" />
                          <span>Stream URL</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Clean Unboxed Card Metadata (Zero-Pill Discipline) */}
                  <div
                    onClick={() => handleInspectMovie(movie)}
                    className="p-3.5 cursor-pointer flex-1 flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-amber-400 transition-colors">
                        {movie.title}
                      </h3>
                      <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                        {movie.genres.slice(0, 2).join(' / ')}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono tabular-nums text-neutral-400">
                      <span
                        className={
                          isMovieUpcoming(movie)
                            ? 'text-amber-300/90'
                            : 'text-emerald-400/90'
                        }
                      >
                        {isMovieUpcoming(movie)
                          ? `Upcoming · ${movie.year}`
                          : `Available · ${movie.year}`}
                      </span>
                      <span className="text-amber-400 font-semibold">
                        ★ {movie.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. Dedicated Upcoming Movies Horizon Strip (When viewing 'all') */}
      {activeCategory === 'all' &&
        searchResults === null &&
        upcomingShowcase.length > 0 && (
          <section className="pt-4 border-t border-white/[0.07] space-y-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>TMDB Theatrical Horizon · Late 2026–2027</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Upcoming Movies &amp; Official Trailers
                </h2>
              </div>

              <button
                type="button"
                onClick={() => onSelectCategory('upcoming')}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1"
              >
                <span>View All Upcoming</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {upcomingShowcase.slice(0, 3).map((movie) => (
                <div
                  key={`up-${movie.id}`}
                  className="group rounded-2xl bg-[#111219] border border-white/[0.08] hover:border-amber-400/40 overflow-hidden flex flex-col justify-between transition-all shadow-lg"
                >
                  <div
                    onClick={() => onWatchTrailer(movie)}
                    className="relative aspect-video bg-black overflow-hidden cursor-pointer"
                  >
                    <img
                      src={movie.backdropUrl || movie.posterUrl}
                      alt={movie.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111219] via-black/30 to-transparent" />

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-11 h-11 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    </div>

                    <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-xs font-mono text-neutral-200">
                      <span>Release: {movie.releaseDate}</span>
                      <span className="text-amber-300">★ {movie.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                        {movie.title}
                      </h3>
                      <p className="text-xs text-neutral-400 line-clamp-2 mt-1">
                        {movie.overview}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-2 border-t border-white/[0.06]">
                      <button
                        type="button"
                        onClick={() => onWatchTrailer(movie)}
                        className="text-xs font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Play Official Trailer</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleInspectMovie(movie)}
                        className="text-xs font-medium text-neutral-300 hover:text-white inline-flex items-center gap-1"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Posters &amp; Similar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      {/* 4. Curated Movie Recommendations Bento Section */}
      {activeCategory === 'all' &&
        searchResults === null &&
        recommendedShowcase.length > 0 && (
          <section className="pt-4 border-t border-white/[0.07] space-y-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-indigo-400 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Personalized Cinema Curations</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Critics &amp; Audience Movie Recommendations
                </h2>
              </div>

              <button
                type="button"
                onClick={() => onSelectCategory('recommended')}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
              >
                <span>All Recommendations</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {recommendedShowcase.slice(0, 4).map((movie) => (
                <div
                  key={`rec-${movie.id}`}
                  className="rounded-2xl bg-[#101118] border border-white/[0.08] hover:border-white/[0.18] p-4 flex flex-col sm:flex-row gap-4 transition-all"
                >
                  <div
                    onClick={() => handleInspectMovie(movie)}
                    className="w-full sm:w-32 aspect-[2/3] rounded-xl overflow-hidden bg-black shrink-0 cursor-pointer border border-white/[0.08]"
                  >
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="text-xs font-mono text-neutral-400">
                        <span>{movie.year}</span>
                        <span aria-hidden="true" className="mx-1.5">
                          ·
                        </span>
                        <span>{movie.genres.join(' / ')}</span>
                        <span aria-hidden="true" className="mx-1.5">
                          ·
                        </span>
                        <span className="text-amber-400">
                          ★ {movie.rating.toFixed(1)}
                        </span>
                      </div>

                      <h3
                        onClick={() => handleInspectMovie(movie)}
                        className="text-lg font-bold text-white hover:text-amber-400 cursor-pointer transition-colors mt-1"
                      >
                        {movie.title}
                      </h3>

                      <p className="text-xs text-neutral-400 mt-1 line-clamp-3 leading-relaxed">
                        {movie.overview}
                      </p>

                      <p className="text-[11px] text-neutral-500 mt-2">
                        Director: <span className="text-neutral-300">{movie.director}</span> · Cast:{' '}
                        <span className="text-neutral-300">
                          {movie.cast.slice(0, 3).join(', ')}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.06]">
                      <button
                        type="button"
                        onClick={() => onWatchTrailer(movie)}
                        className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs inline-flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Watch Trailer</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleInspectMovie(movie)}
                        className="px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white font-medium text-xs inline-flex items-center gap-1.5"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                        <span>View Posters</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenCustomStreamForMovie(movie)}
                        className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-neutral-300 hover:text-white font-medium text-xs inline-flex items-center gap-1.5"
                      >
                        <Link2 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Load Stream URL</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      {/* 5. Interactive Movie Detail, High-Res Poster Gallery, Custom Stream & Recommendations Modal */}
      {selectedMovie && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedMovie.title} Details and Posters`}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={() => setSelectedMovie(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#101118] border border-white/[0.12] shadow-2xl p-6 sm:p-8 space-y-8"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedMovie(null)}
              className="absolute top-5 right-5 z-20 p-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.16] text-neutral-300 hover:text-white transition-colors"
              aria-label="Close movie details"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Top Grid: High-Res Poster Showcase + Movie Info & Custom URL Loader */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-7">
              {/* Left Column: High-Resolution Poster Gallery */}
              <div className="md:col-span-4 space-y-3">
                <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-black border border-white/[0.12] shadow-xl">
                  <img
                    src={
                      selectedMovie.posterGallery?.[activePosterIndex] ||
                      selectedMovie.posterUrl
                    }
                    alt={`${selectedMovie.title} High-Resolution Poster`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Poster Gallery Switcher & Full-Res Link */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {(selectedMovie.posterGallery?.length
                      ? selectedMovie.posterGallery
                      : [selectedMovie.posterUrl]
                    ).map((pUrl, idx) => (
                      <button
                        key={pUrl + idx}
                        type="button"
                        onClick={() => setActivePosterIndex(idx)}
                        className={`w-10 h-14 rounded-lg overflow-hidden border transition-all ${
                          activePosterIndex === idx
                            ? 'border-amber-400 ring-2 ring-amber-400/30 scale-105'
                            : 'border-white/15 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={pUrl}
                          alt={`Poster variant ${idx + 1}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>

                  <a
                    href={
                      selectedMovie.posterGallery?.[activePosterIndex] ||
                      selectedMovie.posterUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-[11px] font-medium text-neutral-300 hover:text-white inline-flex items-center gap-1"
                  >
                    <span>Full Poster</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Right Column: Synopsis, Trailer Action & Attach Custom Movie URL */}
              <div className="md:col-span-8 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-amber-400 uppercase">
                    <span>TMDB #{selectedMovie.tmdbId}</span>
                    <span aria-hidden="true" className="text-neutral-600">
                      ·
                    </span>
                    <span
                      className={
                        isMovieUpcoming(selectedMovie)
                          ? 'text-amber-300'
                          : 'text-emerald-400'
                      }
                    >
                      {isMovieUpcoming(selectedMovie)
                        ? `Upcoming (${selectedMovie.releaseDate})`
                        : `Available (${selectedMovie.releaseDate})`}
                    </span>
                    <span aria-hidden="true" className="text-neutral-600">
                      ·
                    </span>
                    <span>★ {selectedMovie.rating.toFixed(1)}</span>
                    <span aria-hidden="true" className="text-neutral-600">
                      ·
                    </span>
                    <span className="text-neutral-300">
                      {selectedMovie.runtime}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {selectedMovie.title}
                  </h2>

                  {selectedMovie.tagline && (
                    <p className="text-sm italic text-amber-300/90">
                      “{selectedMovie.tagline}”
                    </p>
                  )}

                  <div className="text-xs text-neutral-300 font-medium">
                    <span>{selectedMovie.genres.join(' / ')}</span>
                    <span aria-hidden="true" className="mx-2 text-neutral-600">
                      ·
                    </span>
                    <span>
                      Director:{' '}
                      <strong className="text-white">
                        {selectedMovie.director}
                      </strong>
                    </span>
                  </div>

                  <p className="text-sm text-neutral-300 leading-relaxed pt-1">
                    {selectedMovie.overview}
                  </p>

                  <div className="pt-1 text-xs text-neutral-400">
                    <span className="text-neutral-500 font-medium">
                      Featured Cast:{' '}
                    </span>
                    <span className="text-neutral-200">
                      {selectedMovie.cast.join(' · ')}
                    </span>
                  </div>
                </div>

                {/* Action Box 1: Play Official YouTube Trailer */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const m = selectedMovie;
                      setSelectedMovie(null);
                      onWatchTrailer(m);
                    }}
                    className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-lg shadow-amber-500/20"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Watch Official Trailer (YouTube)</span>
                  </button>
                </div>

                {/* Action Box 2: Bring Your Own URL / File to Stream This Movie */}
                <div className="p-4 rounded-2xl bg-[#161822] border border-white/[0.1] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        Stream “{selectedMovie.title}” via Your Own URL or File
                      </span>
                    </span>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      YouTube · .M3U8 · .MP4 · Local File
                    </span>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!customMovieStreamUrl.trim()) return;
                      const m = selectedMovie;
                      const u = customMovieStreamUrl.trim();
                      setSelectedMovie(null);
                      onOpenCustomStreamForMovie(m, u);
                    }}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
                  >
                    <input
                      type="text"
                      value={customMovieStreamUrl}
                      onChange={(e) => setCustomMovieStreamUrl(e.target.value)}
                      placeholder={`Paste YouTube, .m3u8, or .mp4 URL for ${selectedMovie.title}…`}
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/[0.12] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs inline-flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Play Custom URL</span>
                    </button>

                    <label className="px-3.5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-neutral-200 font-medium text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0">
                      <Upload className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Local File</span>
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/ogg,.mp4,.webm,.mkv,.mov"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          const blobUrl = URL.createObjectURL(f);
                          const m = selectedMovie;
                          setSelectedMovie(null);
                          onUploadLocalVideoForMovie(m, blobUrl, f.name);
                        }}
                      />
                    </label>
                  </form>
                </div>
              </div>
            </div>

            {/* Bottom Section: Similar Movie Recommendations (TMDB Engine) */}
            {similarRecommendations.length > 0 && (
              <div className="pt-6 border-t border-white/[0.08] space-y-4">
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider text-amber-400">
                    TMDB Recommendations Engine
                  </p>
                  <h3 className="text-lg font-bold text-white">
                    Recommended Movies Similar to {selectedMovie.title}
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
                  {similarRecommendations.map((rec) => (
                    <div
                      key={`sim-${rec.id}`}
                      onClick={() => handleInspectMovie(rec)}
                      className="group rounded-xl bg-[#151620] border border-white/[0.07] hover:border-amber-400/50 overflow-hidden cursor-pointer flex flex-col justify-between transition-all"
                    >
                      <div className="relative aspect-[2/3] bg-black overflow-hidden">
                        <img
                          src={rec.posterUrl}
                          alt={rec.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-2.5">
                        <div className="text-xs font-bold text-white truncate group-hover:text-amber-400">
                          {rec.title}
                        </div>
                        <div className="text-[10px] font-mono text-neutral-400 mt-0.5 flex items-center justify-between">
                          <span>{rec.year}</span>
                          <span className="text-amber-400">
                            ★ {rec.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
