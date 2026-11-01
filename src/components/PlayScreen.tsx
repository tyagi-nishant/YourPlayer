import React, { useState, useMemo } from 'react';
import { MediaItem, ThemeMode, PaletteTone } from '../types';
import { MEDIA_ITEMS } from '../data/content';
import {
  Play,
  Search,
  Maximize2,
  Minimize2,
  SkipForward,
  SkipBack,
  Bookmark,
  Share2,
  PlusCircle,
  Clock,
  Sparkles,
  Tv,
  X,
  Check,
  ListVideo
} from 'lucide-react';

interface PlayScreenProps {
  theme: ThemeMode;
  paletteTone: PaletteTone;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info' | 'warning') => void;
}

// Helper to extract YouTube ID from various URL formats or direct 11-char ID
function extractYouTubeId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Direct 11-character ID match (only if it looks like an ID without spaces)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Standard YouTube URL patterns
  const regExp = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = trimmed.match(regExp);
  if (match && match[1] && match[1].length === 11) {
    return match[1];
  }
  return null;
}

export const PlayScreen: React.FC<PlayScreenProps> = ({
  theme,
  paletteTone,
  onShowToast,
}) => {
  const isDark = theme === 'dark';

  const [mediaList, setMediaList] = useState<MediaItem[]>(MEDIA_ITEMS);
  const [activeMedia, setActiveMedia] = useState<MediaItem>(MEDIA_ITEMS[0]);
  const [startSeconds, setStartSeconds] = useState<number>(0);
  const [shouldAutoplay, setShouldAutoplay] = useState<boolean>(false);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [savedIds, setSavedIds] = useState<string[]>(['media-1', 'media-6']);

  // Custom URL modal / drawer state
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [customTitleInput, setCustomTitleInput] = useState<string>('');

  // Player presentation controls
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [ambientGlow, setAmbientGlow] = useState<boolean>(true);
  const [failedThumbnails, setFailedThumbnails] = useState<Record<string, boolean>>({});

  const categories = ['All', 'Keynotes', 'Tutorials', 'Design & Motion', 'Focus Beats', 'Saved'];

  // Check if the search input itself is a pasted YouTube URL
  const detectedYoutubeIdInSearch = useMemo(() => {
    if (searchQuery.includes('youtube.com') || searchQuery.includes('youtu.be')) {
      return extractYouTubeId(searchQuery);
    }
    return null;
  }, [searchQuery]);

  const filteredMedia = useMemo(() => {
    return mediaList.filter((item) => {
      const matchesCat =
        selectedCategory === 'All'
          ? true
          : selectedCategory === 'Saved'
          ? savedIds.includes(item.id)
          : item.category === selectedCategory;

      const q = searchQuery.trim().toLowerCase();
      if (!q || detectedYoutubeIdInSearch) return matchesCat;

      const matchesSearch =
        item.title.toLowerCase().includes(q) ||
        item.channel.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);

      return matchesCat && matchesSearch;
    });
  }, [mediaList, selectedCategory, searchQuery, savedIds, detectedYoutubeIdInSearch]);

  const handleSelectVideo = (item: MediaItem, autoPlay = true) => {
    setActiveMedia(item);
    setStartSeconds(0);
    setShouldAutoplay(autoPlay);
    // Smooth scroll to the player top if user clicked from the lower grid
    const playerEl = document.getElementById('play-screen-viewport');
    if (playerEl) {
      playerEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleJumpToChapter = (seconds: number, label: string) => {
    setStartSeconds(seconds);
    setShouldAutoplay(true);
    onShowToast(`Jumped to ${label}`, `Playback seeking to ${Math.floor(seconds / 60)}m ${seconds % 60}s.`);
  };

  const handleNextVideo = () => {
    const currentIndex = mediaList.findIndex((m) => m.id === activeMedia.id);
    const nextIndex = (currentIndex + 1) % mediaList.length;
    handleSelectVideo(mediaList[nextIndex], true);
  };

  const handlePrevVideo = () => {
    const currentIndex = mediaList.findIndex((m) => m.id === activeMedia.id);
    const prevIndex = (currentIndex - 1 + mediaList.length) % mediaList.length;
    handleSelectVideo(mediaList[prevIndex], true);
  };

  const toggleSaveMedia = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSavedIds((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        onShowToast('Removed from Saved Queue', 'Video removed from your personal watchlist.');
        return prev.filter((item) => item !== id);
      } else {
        onShowToast('Added to Saved Queue', 'Video bookmarked to your Saved filter tab.', 'success');
        return [...prev, id];
      }
    });
  };

  const handleShareVideo = () => {
    const url = `https://www.youtube.com/watch?v=${activeMedia.youtubeId}`;
    navigator.clipboard.writeText(url);
    onShowToast('Video Link Copied', `${activeMedia.title} URL copied to clipboard.`);
  };

  const handleLoadCustomVideo = (e: React.FormEvent) => {
    e.preventDefault();
    const ytId = extractYouTubeId(customUrlInput);
    if (!ytId) {
      onShowToast(
        'Invalid YouTube URL or ID',
        'Please paste a valid YouTube watch link, share link, or 11-character video ID.',
        'warning'
      );
      return;
    }

    const newMedia: MediaItem = {
      id: `custom-${Date.now()}`,
      youtubeId: ytId,
      title: customTitleInput.trim() || `Custom Stream · ${ytId}`,
      channel: 'User Embedded Stream',
      category: 'Custom',
      duration: 'STREAM',
      published: 'Just Added',
      description: `Custom YouTube video stream loaded directly via ID (${ytId}).`,
      chapters: [{ time: '00:00', label: 'Start of Stream', seconds: 0 }],
    };

    setMediaList((prev) => [newMedia, ...prev]);
    setActiveMedia(newMedia);
    setStartSeconds(0);
    setShouldAutoplay(true);
    setCustomUrlInput('');
    setCustomTitleInput('');
    setShowCustomInput(false);
    onShowToast('Custom Video Loaded', 'Playing your embedded YouTube video now.', 'success');
  };

  const handlePlayPastedSearchUrl = () => {
    if (!detectedYoutubeIdInSearch) return;
    const newMedia: MediaItem = {
      id: `custom-${Date.now()}`,
      youtubeId: detectedYoutubeIdInSearch,
      title: `Instant YouTube Stream (${detectedYoutubeIdInSearch})`,
      channel: 'Direct URL Embed',
      category: 'Custom',
      duration: 'LIVE / VOD',
      published: 'Direct Play',
      description: `Loaded directly from search bar URL input.`,
    };
    setMediaList((prev) => [newMedia, ...prev]);
    setActiveMedia(newMedia);
    setStartSeconds(0);
    setShouldAutoplay(true);
    setSearchQuery('');
    onShowToast('Playing Direct YouTube Link', `Embedded video ${detectedYoutubeIdInSearch} is now active.`, 'success');
  };

  const accentButtonClass =
    paletteTone === 'cobalt'
      ? 'bg-blue-600 hover:bg-blue-700 text-white'
      : paletteTone === 'sandstone'
      ? 'bg-amber-600 hover:bg-amber-700 text-white'
      : isDark
      ? 'bg-white hover:bg-neutral-200 text-neutral-900'
      : 'bg-neutral-900 hover:bg-neutral-800 text-white';

  const embedSrc = `https://www.youtube.com/embed/${activeMedia.youtubeId}?rel=0&modestbranding=1&autoplay=${
    shouldAutoplay ? 1 : 0
  }${startSeconds > 0 ? `&start=${startSeconds}` : ''}`;

  return (
    <section
      id="play"
      className="py-20 lg:py-28 border-t border-neutral-200 dark:border-neutral-800 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header + Search & Custom Embed Trigger */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider opacity-60 mb-2">
              Interactive Media Screening Room · YouTube Embed Engine
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Play Screen &amp; On-Demand Keynotes.
            </h2>
            <p className="text-sm opacity-70 mt-2 max-w-2xl">
              Search our curated engineering talks, tutorials, and ambient coding mixes below, or paste any YouTube link to watch immediately inside the theater player.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowCustomInput(!showCustomInput)}
              className={`px-4 py-2.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-2 whitespace-nowrap ${
                showCustomInput
                  ? isDark
                    ? 'bg-neutral-800 border-neutral-600 text-white'
                    : 'bg-neutral-200 border-neutral-400 text-neutral-900'
                  : isDark
                  ? 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800 text-neutral-200'
                  : 'bg-white border-neutral-200 hover:bg-neutral-100 text-neutral-800'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Embed Custom YouTube URL</span>
            </button>

            <button
              onClick={() => setAmbientGlow(!ambientGlow)}
              className={`px-3.5 py-2.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                ambientGlow
                  ? isDark
                    ? 'border-neutral-700 bg-neutral-900 text-amber-400'
                    : 'border-neutral-300 bg-neutral-100 text-amber-700'
                  : 'border-neutral-200 dark:border-neutral-800 opacity-60 hover:opacity-100'
              }`}
              title="Toggle Ambient Cinema Backlight"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ambient Glow</span>
            </button>
          </div>
        </div>

        {/* Collapsible Custom YouTube URL Loader Drawer */}
        {showCustomInput && (
          <form
            onSubmit={handleLoadCustomVideo}
            className={`mb-8 p-5 rounded-2xl border transition-all ${
              isDark
                ? 'bg-neutral-900/95 border-neutral-700 text-neutral-100'
                : 'bg-neutral-100 border-neutral-300 text-neutral-900'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                <Tv className="w-4 h-4 text-emerald-500" />
                <span>Load Any YouTube Video URL or Video ID</span>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomInput(false)}
                className="p-1 opacity-60 hover:opacity-100"
                aria-label="Close custom URL loader"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-6">
                <input
                  type="text"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="Paste YouTube URL (e.g. https://www.youtube.com/watch?v=8aGhZQkoFbQ)"
                  className={`w-full px-3.5 py-2.5 text-xs rounded-lg border outline-none ${
                    isDark
                      ? 'bg-neutral-950 border-neutral-800 text-white placeholder-neutral-500 focus:border-neutral-600'
                      : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-neutral-500'
                  }`}
                  required
                />
              </div>
              <div className="md:col-span-4">
                <input
                  type="text"
                  value={customTitleInput}
                  onChange={(e) => setCustomTitleInput(e.target.value)}
                  placeholder="Optional custom title..."
                  className={`w-full px-3.5 py-2.5 text-xs rounded-lg border outline-none ${
                    isDark
                      ? 'bg-neutral-950 border-neutral-800 text-white placeholder-neutral-500 focus:border-neutral-600'
                      : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-neutral-500'
                  }`}
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className={`w-full h-full py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${accentButtonClass}`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play Now</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Prominent Search & Play Bar */}
        <div
          id="play-screen-viewport"
          className={`p-3 sm:p-4 rounded-2xl border mb-8 transition-colors ${
            isDark
              ? 'bg-neutral-900/80 border-neutral-800'
              : 'bg-white border-neutral-200 shadow-xs'
          }`}
        >
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search input with instant YouTube URL detection */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos by topic, speaker, or paste a YouTube link to play..."
                className={`w-full pl-10 pr-24 py-2.5 text-xs sm:text-sm rounded-xl border outline-none transition-colors ${
                  isDark
                    ? 'bg-neutral-950 border-neutral-800 text-neutral-100 placeholder-neutral-500 focus:border-neutral-600'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-neutral-400'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-50 hover:opacity-100 px-1.5 py-0.5"
                >
                  Clear
                </button>
              )}
            </div>

            {/* If user pasted a valid YouTube URL into the search box, offer 1-click Instant Play */}
            {detectedYoutubeIdInSearch && (
              <button
                onClick={handlePlayPastedSearchUrl}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0 shadow-sm ${accentButtonClass}`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Pasted YouTube Link</span>
              </button>
            )}

            {/* Category Segmented Filter Buttons */}
            <div
              className={`flex items-center gap-1 p-1 rounded-xl border overflow-x-auto ${
                isDark
                  ? 'bg-neutral-950 border-neutral-800'
                  : 'bg-neutral-100 border-neutral-200'
              }`}
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? isDark
                        ? 'bg-neutral-800 text-white shadow-xs font-semibold'
                        : 'bg-white text-neutral-900 shadow-xs font-semibold'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {cat}
                  {cat === 'Saved' && ` (${savedIds.length})`}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Search Topic Suggestions */}
          <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-neutral-200/60 dark:border-neutral-800/60 text-xs overflow-x-auto">
            <span className="opacity-50 whitespace-nowrap font-mono text-[11px]">
              Quick Search:
            </span>
            {['Event Loop', 'Tailwind', 'React', 'Design Systems', 'Lofi', 'Neural Network'].map(
              (topic) => (
                <button
                  key={topic}
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery(topic);
                  }}
                  className="text-xs opacity-70 hover:opacity-100 hover:underline underline-offset-4 whitespace-nowrap transition-opacity"
                >
                  {topic}
                </button>
              )
            )}
          </div>
        </div>

        {/* Main Cinema Stage + Up Next Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16 relative">
          {/* Ambient Glow Backlight */}
          {ambientGlow && (
            <div
              className="absolute -inset-6 pointer-events-none opacity-20 dark:opacity-30 blur-3xl rounded-3xl -z-10 transition-all duration-700"
              style={{
                background:
                  paletteTone === 'cobalt'
                    ? 'radial-gradient(circle at 35% 35%, #3b82f6 0%, #1d4ed8 40%, transparent 75%)'
                    : paletteTone === 'sandstone'
                    ? 'radial-gradient(circle at 35% 35%, #d97706 0%, #78350f 40%, transparent 75%)'
                    : 'radial-gradient(circle at 35% 35%, #10b981 0%, #3b82f6 45%, transparent 75%)',
              }}
            />
          )}

          {/* Primary Embedded YouTube Player Column */}
          <div className={isTheaterMode ? 'lg:col-span-12' : 'lg:col-span-8'}>
            <div
              className={`rounded-2xl border overflow-hidden transition-all ${
                isDark
                  ? 'bg-neutral-900/90 border-neutral-800 shadow-2xl'
                  : 'bg-white border-neutral-200 shadow-lg'
              }`}
            >
              {/* 16:9 Responsive YouTube Embed Frame */}
              <div className="relative w-full aspect-video bg-black">
                <iframe
                  key={`${activeMedia.youtubeId}-${startSeconds}-${shouldAutoplay}`}
                  src={embedSrc}
                  title={activeMedia.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>

              {/* Player Control Deck & Active Video Details */}
              <div className="p-5 sm:p-6">
                {/* Top Control Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-neutral-200 dark:border-neutral-800">
                  {/* Unboxed Metadata with middot separators */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono opacity-70">
                    <span className="font-semibold text-neutral-900 dark:text-white">
                      {activeMedia.category}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{activeMedia.channel}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{activeMedia.duration}</span>
                    <span aria-hidden="true">·</span>
                    <span>{activeMedia.published}</span>
                  </div>

                  {/* Playback & View Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevVideo}
                      className={`p-2 rounded-lg border text-xs transition-colors ${
                        isDark
                          ? 'border-neutral-800 hover:bg-neutral-800 text-neutral-300'
                          : 'border-neutral-200 hover:bg-neutral-100 text-neutral-700'
                      }`}
                      title="Previous Video"
                      aria-label="Previous Video"
                    >
                      <SkipBack className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={handleNextVideo}
                      className={`p-2 rounded-lg border text-xs transition-colors ${
                        isDark
                          ? 'border-neutral-800 hover:bg-neutral-800 text-neutral-300'
                          : 'border-neutral-200 hover:bg-neutral-100 text-neutral-700'
                      }`}
                      title="Next Video"
                      aria-label="Next Video"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => toggleSaveMedia(activeMedia.id)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                        savedIds.includes(activeMedia.id)
                          ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-500 font-semibold'
                          : isDark
                          ? 'border-neutral-800 hover:bg-neutral-800 text-neutral-300'
                          : 'border-neutral-200 hover:bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>{savedIds.includes(activeMedia.id) ? 'Saved' : 'Save'}</span>
                    </button>

                    <button
                      onClick={handleShareVideo}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                        isDark
                          ? 'border-neutral-800 hover:bg-neutral-800 text-neutral-300'
                          : 'border-neutral-200 hover:bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Copy Link</span>
                    </button>

                    <button
                      onClick={() => setIsTheaterMode(!isTheaterMode)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium hidden lg:flex items-center gap-1.5 transition-colors ${
                        isTheaterMode
                          ? isDark
                            ? 'bg-neutral-800 border-neutral-600 text-white'
                            : 'bg-neutral-900 border-neutral-900 text-white'
                          : isDark
                          ? 'border-neutral-800 hover:bg-neutral-800 text-neutral-300'
                          : 'border-neutral-200 hover:bg-neutral-100 text-neutral-700'
                      }`}
                      title="Toggle Wide Theater Mode"
                    >
                      {isTheaterMode ? (
                        <>
                          <Minimize2 className="w-3.5 h-3.5" />
                          <span>Default View</span>
                        </>
                      ) : (
                        <>
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Theater Mode</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
                  {activeMedia.title}
                </h3>
                <p className="text-sm opacity-75 leading-relaxed mb-6">
                  {activeMedia.description}
                </p>

                {/* Interactive Timestamp Chapters (Jump directly inside the YouTube video) */}
                {activeMedia.chapters && activeMedia.chapters.length > 0 && (
                  <div className="pt-4 border-t border-neutral-200/70 dark:border-neutral-800/70">
                    <div className="text-xs font-mono uppercase tracking-wider opacity-60 mb-3 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Interactive Timestamp Chapters (Click to Seek)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                      {activeMedia.chapters.map((chap, idx) => {
                        const isCurrentChapter = startSeconds === chap.seconds && shouldAutoplay;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleJumpToChapter(chap.seconds, chap.label)}
                            className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                              isCurrentChapter
                                ? isDark
                                  ? 'bg-neutral-800 border-neutral-600 text-white'
                                  : 'bg-neutral-100 border-neutral-400 text-neutral-900'
                                : isDark
                                ? 'bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700 text-neutral-300'
                                : 'bg-neutral-50 border-neutral-200/80 hover:border-neutral-300 text-neutral-700'
                            }`}
                          >
                            <span className="text-[11px] font-mono font-bold text-emerald-500 tabular-nums mb-1">
                              {chap.time}
                            </span>
                            <span className="text-xs font-medium line-clamp-1">
                              {chap.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Up Next / Interactive Playlist Queue Sidebar */}
          <div className={isTheaterMode ? 'lg:col-span-12' : 'lg:col-span-4'}>
            <div
              className={`rounded-2xl border p-5 transition-all ${
                isDark
                  ? 'bg-neutral-900/70 border-neutral-800'
                  : 'bg-white border-neutral-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <ListVideo className="w-4 h-4 text-emerald-500" />
                  <h4 className="text-sm font-bold tracking-tight">
                    Up Next Queue
                  </h4>
                </div>
                <span className="text-xs font-mono opacity-60 tabular-nums">
                  {filteredMedia.length} Videos
                </span>
              </div>

              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                {filteredMedia.map((item) => {
                  const isPlaying = item.id === activeMedia.id;
                  const thumbFailed = failedThumbnails[item.id];
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectVideo(item, true)}
                      className={`group p-2.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                        isPlaying
                          ? isDark
                            ? 'bg-neutral-800/90 border-neutral-600 text-white shadow-sm'
                            : 'bg-neutral-100 border-neutral-400 text-neutral-900 shadow-sm'
                          : isDark
                          ? 'bg-neutral-950/40 border-neutral-800/60 hover:bg-neutral-900 hover:border-neutral-700'
                          : 'bg-neutral-50/60 border-neutral-200/60 hover:bg-neutral-100 hover:border-neutral-300'
                      }`}
                    >
                      {/* Thumbnail with resilient fallback */}
                      <div className="relative w-24 aspect-video rounded-lg overflow-hidden bg-neutral-950 shrink-0 border border-neutral-800 flex items-center justify-center">
                        {!thumbFailed ? (
                          <img
                            src={`https://i.ytimg.com/vi/${item.youtubeId}/hqdefault.jpg`}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            onError={() =>
                              setFailedThumbnails((prev) => ({ ...prev, [item.id]: true }))
                            }
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <Tv className="w-5 h-5 text-neutral-500" />
                        )}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-4 h-4 text-white fill-white" />
                        </div>
                      </div>

                      {/* Item Info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold line-clamp-2 leading-snug mb-1">
                          {item.title}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] opacity-60 font-mono truncate">
                          <span className="truncate">{item.channel}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums shrink-0">{item.duration}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Below-the-Player Play Options Grid: Browse & Click any option to play */}
        <div>
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-neutral-200 dark:border-neutral-800">
            <div>
              <h3 className="text-lg font-bold tracking-tight">
                All Playable Channels &amp; Video Library
              </h3>
              <p className="text-xs opacity-65">
                Select any card below to immediately load and play it in the main theater screen above.
              </p>
            </div>
            {searchQuery && (
              <span className="text-xs font-mono opacity-70">
                Showing results for &ldquo;{searchQuery}&rdquo;
              </span>
            )}
          </div>

          {filteredMedia.length === 0 ? (
            <div className="text-center py-14 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800">
              <p className="text-sm opacity-70 mb-2">
                No videos in the library match &ldquo;{searchQuery}&rdquo;.
              </p>
              <div className="flex items-center justify-center gap-3 mt-4">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Reset Search Filters
                </button>
                <button
                  onClick={() => {
                    setShowCustomInput(true);
                    setCustomTitleInput(searchQuery);
                  }}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${accentButtonClass}`}
                >
                  Embed Custom YouTube Link Instead
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredMedia.map((item) => {
                const isPlaying = item.id === activeMedia.id;
                const isSaved = savedIds.includes(item.id);
                const thumbFailed = failedThumbnails[item.id];

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectVideo(item, true)}
                    className={`group cursor-pointer rounded-2xl border overflow-hidden flex flex-col justify-between transition-all duration-200 ${
                      isPlaying
                        ? isDark
                          ? 'bg-neutral-900 border-neutral-500 ring-1 ring-neutral-500 shadow-lg'
                          : 'bg-white border-neutral-900 ring-1 ring-neutral-900 shadow-md'
                        : isDark
                        ? 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
                        : 'bg-white border-neutral-200 hover:border-neutral-300 hover:shadow-md'
                    }`}
                  >
                    <div>
                      {/* 16:9 Thumbnail Preview with Play Overlay */}
                      <div className="relative w-full aspect-video bg-neutral-950 overflow-hidden border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
                        {!thumbFailed ? (
                          <img
                            src={`https://i.ytimg.com/vi/${item.youtubeId}/hqdefault.jpg`}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            onError={() =>
                              setFailedThumbnails((prev) => ({ ...prev, [item.id]: true }))
                            }
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-neutral-500 gap-1">
                            <Tv className="w-6 h-6" />
                            <span className="text-[10px] font-mono">{item.youtubeId}</span>
                          </div>
                        )}

                        {/* Measured Scrim & Play Button Affordance */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-center justify-center">
                          <div
                            className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shadow-lg ${
                              isPlaying
                                ? 'bg-emerald-500 text-white'
                                : 'bg-white/95 text-neutral-900'
                            }`}
                          >
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          </div>
                        </div>

                        {/* Bottom Left Status / Duration */}
                        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-white/90">
                          <span>{isPlaying ? 'NOW PLAYING' : item.category}</span>
                          <span className="tabular-nums font-semibold">{item.duration}</span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-4">
                        {/* Unboxed Metadata */}
                        <div className="flex items-center gap-1.5 text-[11px] font-mono opacity-60 mb-1.5">
                          <span className="truncate">{item.channel}</span>
                          <span aria-hidden="true">·</span>
                          <span className="shrink-0">{item.published}</span>
                        </div>

                        <h4 className="text-sm font-bold tracking-tight line-clamp-2 mb-2 group-hover:underline decoration-1 underline-offset-4">
                          {item.title}
                        </h4>

                        <p className="text-xs opacity-70 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer Action */}
                    <div className="px-4 py-3 border-t border-neutral-200/70 dark:border-neutral-800/70 flex items-center justify-between text-xs">
                      <span className="font-semibold flex items-center gap-1.5">
                        <Play className="w-3 h-3 fill-current" />
                        <span>{isPlaying ? 'Playing in Theater' : 'Click to Play'}</span>
                      </span>

                      <button
                        type="button"
                        onClick={(e) => toggleSaveMedia(item.id, e)}
                        className="opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1"
                        title={isSaved ? 'Remove from Saved' : 'Save for later'}
                      >
                        {isSaved ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-500 font-medium">Saved</span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-3.5 h-3.5" />
                            <span>Save</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
