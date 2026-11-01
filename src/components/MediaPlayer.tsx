import React, { useState, useEffect, useRef, useMemo } from 'react';
import Hls from 'hls.js';
import {
  ResolvedMedia,
  SubtitleTrackOption,
  TmdbMovie,
} from '../types';
import { PlatformBadge } from './PlatformBadge';
import { PlaybackError } from './PlaybackError';
import { UnsupportedProviderMessage } from './UnsupportedProviderMessage';
import {
  ArrowLeft,
  Link2,
  Maximize2,
  ExternalLink,
  Sparkles,
  Check,
  Copy,
  RotateCcw,
  Play,
  Subtitles,
  Settings,
  Upload,
  Plus,
  X,
  Gauge,
  PictureInPicture2,
  RotateCw,
  Film,
} from 'lucide-react';

interface MediaPlayerProps {
  media: ResolvedMedia;
  similarMovies?: TmdbMovie[];
  onBackHome: () => void;
  onPlayAnother: () => void;
  onSelectSampleUrl: (url: string) => void;
  onWatchMovieTrailer?: (movie: TmdbMovie) => void;
  onAttachCustomUrlToMovie?: (movie: TmdbMovie, rawUrl: string) => void;
  onUploadLocalFileForMovie?: (
    movie: TmdbMovie | undefined,
    blobUrl: string,
    fileName: string
  ) => void;
}

interface HlsQualityLevel {
  index: number;
  height: number;
  width: number;
  bitrate: number;
  label: string;
}

interface ParsedSubtitleCue {
  start: number;
  end: number;
  text: string;
}

function parseTimestampToSeconds(raw: string): number {
  const cleaned = raw.trim().replace(',', '.');
  const parts = cleaned.split(':');
  if (parts.length === 3) {
    const h = parseFloat(parts[0]) || 0;
    const m = parseFloat(parts[1]) || 0;
    const s = parseFloat(parts[2]) || 0;
    return h * 3600 + m * 60 + s;
  }
  if (parts.length === 2) {
    const m = parseFloat(parts[0]) || 0;
    const s = parseFloat(parts[1]) || 0;
    return m * 60 + s;
  }
  return 0;
}

function parseVttOrSrtToCues(rawContent: string): ParsedSubtitleCue[] {
  const normalized = rawContent
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();

  const blocks = normalized.split(/\n{2,}/);
  const cues: ParsedSubtitleCue[] = [];

  for (const block of blocks) {
    const lines = block
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) continue;
    if (lines[0].startsWith('WEBVTT') || lines[0].startsWith('NOTE')) continue;

    let timingLineIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('-->')) {
        timingLineIdx = i;
        break;
      }
    }
    if (timingLineIdx === -1) continue;

    const timingParts = lines[timingLineIdx].split('-->');
    if (timingParts.length < 2) continue;

    const startRaw = timingParts[0].trim().split(/\s+/)[0];
    const endRaw = timingParts[1].trim().split(/\s+/)[0];
    const start = parseTimestampToSeconds(startRaw);
    const end = parseTimestampToSeconds(endRaw);

    const textLines = lines
      .slice(timingLineIdx + 1)
      .join('\n')
      .replace(/<[^>]+>/g, '')
      .trim();

    if (textLines && end > start) {
      cues.push({ start, end, text: textLines });
    }
  }

  return cues;
}

export const MediaPlayer: React.FC<MediaPlayerProps> = ({
  media,
  similarMovies = [],
  onBackHome,
  onPlayAnother,
  onSelectSampleUrl,
  onWatchMovieTrailer,
  onAttachCustomUrlToMovie,
  onUploadLocalFileForMovie,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [ambientLight, setAmbientLight] = useState<boolean>(true);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  // Quality Selector State (HLS levels)
  const [qualityLevels, setQualityLevels] = useState<HlsQualityLevel[]>([]);
  const [selectedQualityLevel, setSelectedQualityLevel] = useState<number>(-1); // -1 = Auto
  const [activePlayingHeight, setActivePlayingHeight] = useState<number | null>(
    null
  );

  // Subtitle / CC State
  const [subtitleTracks, setSubtitleTracks] = useState<SubtitleTrackOption[]>(
    []
  );
  const [activeSubtitleId, setActiveSubtitleId] = useState<string>('off');
  const [parsedCues, setParsedCues] = useState<ParsedSubtitleCue[]>([]);
  const [currentCueText, setCurrentCueText] = useState<string>('');
  const [subtitleFontSize, setSubtitleFontSize] = useState<
    'sm' | 'md' | 'lg' | 'xl'
  >('md');
  const [subtitleOffsetSec, setSubtitleOffsetSec] = useState<number>(0);
  const [customSubUrlInput, setCustomSubUrlInput] = useState<string>('');
  const [customSubLabelInput, setCustomSubLabelInput] = useState<string>('');
  const [subUploadFeedback, setSubUploadFeedback] = useState<string | null>(
    null
  );

  // Custom stream URL input for attached TMDB movie
  const [movieCustomUrlInput, setMovieCustomUrlInput] = useState<string>('');

  // Playback Speed State
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Active Popover inside Player ('quality' | 'subtitles' | 'speed' | null)
  const [activePanel, setActivePanel] = useState<
    'quality' | 'subtitles' | 'speed' | null
  >(null);

  const stageContainerRef = useRef<HTMLDivElement | null>(null);
  const hlsVideoRef = useRef<HTMLVideoElement | null>(null);
  const directVideoRef = useRef<HTMLVideoElement | null>(null);
  const hlsInstanceRef = useRef<Hls | null>(null);
  const subtitleFileInputRef = useRef<HTMLInputElement | null>(null);
  const localVideoInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setPlaybackError(null);
    setActivePanel(null);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [media.originalUrl, media.embedUrl, media.directVideoUrl, media.hlsUrl]);

  // Fetch and parse active subtitle track into cues
  useEffect(() => {
    if (activeSubtitleId === 'off') {
      setParsedCues([]);
      setCurrentCueText('');
      return;
    }

    const track = subtitleTracks.find((t) => t.id === activeSubtitleId);
    if (!track || !track.url) {
      setParsedCues([]);
      setCurrentCueText('');
      return;
    }

    let cancelled = false;
    fetch(track.url)
      .then((r) => (r.ok ? r.text() : ''))
      .then((text) => {
        if (cancelled || !text) return;
        const cues = parseVttOrSrtToCues(text);
        setParsedCues(cues);
      })
      .catch(() => {
        if (!cancelled) setParsedCues([]);
      });

    return () => {
      cancelled = true;
    };
  }, [activeSubtitleId, subtitleTracks]);

  // Sync active subtitle cue with video currentTime
  useEffect(() => {
    const videoEl = hlsVideoRef.current || directVideoRef.current;
    if (!videoEl || parsedCues.length === 0 || activeSubtitleId === 'off') {
      setCurrentCueText('');
      return;
    }

    const updateCue = () => {
      const adjustedTime = videoEl.currentTime - subtitleOffsetSec;
      const active = parsedCues.find(
        (c) => adjustedTime >= c.start && adjustedTime <= c.end
      );
      setCurrentCueText(active ? active.text : '');
    };

    videoEl.addEventListener('timeupdate', updateCue);
    videoEl.addEventListener('seeked', updateCue);
    return () => {
      videoEl.removeEventListener('timeupdate', updateCue);
      videoEl.removeEventListener('seeked', updateCue);
    };
  }, [parsedCues, activeSubtitleId, subtitleOffsetSec, media.hlsUrl, media.directVideoUrl]);

  // Attach Hls.js whenever media.hlsUrl is active
  const currentHlsUrl = media.hlsUrl;

  useEffect(() => {
    if (hlsInstanceRef.current) {
      hlsInstanceRef.current.destroy();
      hlsInstanceRef.current = null;
    }

    const videoEl = hlsVideoRef.current;
    if (!currentHlsUrl || !videoEl) return;

    setIsLoading(true);
    setPlaybackError(null);
    setQualityLevels([]);
    setSelectedQualityLevel(-1);
    setActivePlayingHeight(null);

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 60,
      });
      hlsInstanceRef.current = hls;

      hls.loadSource(currentHlsUrl);
      hls.attachMedia(videoEl);

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        setIsLoading(false);
        videoEl.playbackRate = playbackSpeed;

        if (Array.isArray(data.levels) && data.levels.length > 0) {
          const seenHeights = new Set<number>();
          const extracted: HlsQualityLevel[] = [];

          data.levels.forEach((lvl, idx) => {
            const h =
              lvl.height ||
              (lvl.width ? Math.round((lvl.width * 9) / 16) : 0);
            const w = lvl.width || 0;
            const br = lvl.bitrate || 0;
            const label =
              h >= 2160
                ? '2160p (4K Ultra HD)'
                : h >= 1080
                ? '1080p (Full HD)'
                : h >= 720
                ? '720p (HD)'
                : h >= 480
                ? '480p (SD)'
                : h > 0
                ? `${h}p`
                : `Level ${idx + 1} (${Math.round(br / 1000)} kbps)`;

            const dedupeKey = h > 0 ? h : br;
            if (!seenHeights.has(dedupeKey)) {
              seenHeights.add(dedupeKey);
              extracted.push({
                index: idx,
                height: h,
                width: w,
                bitrate: br,
                label,
              });
            }
          });

          extracted.sort(
            (a, b) => b.height - a.height || b.bitrate - a.bitrate
          );
          setQualityLevels(extracted);
          if (extracted.length > 0 && extracted[0].height > 0) {
            setActivePlayingHeight(extracted[0].height);
          }
        }

        videoEl.play().catch(() => {});
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
        const levelObj = hls.levels[data.level];
        if (levelObj && levelObj.height) {
          setActivePlayingHeight(levelObj.height);
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setIsLoading(false);
              setPlaybackError(
                'The HLS stream could not be loaded. Try enabling the HLS Stream Proxy option when pasting the URL.'
              );
              break;
          }
        }
      });
    } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
      videoEl.src = currentHlsUrl;
      videoEl.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        videoEl.playbackRate = playbackSpeed;
        videoEl.play().catch(() => {});
      });
    }

    return () => {
      if (hlsInstanceRef.current) {
        hlsInstanceRef.current.destroy();
        hlsInstanceRef.current = null;
      }
    };
  }, [currentHlsUrl, reloadKey]);

  const handleSelectQuality = (levelIndex: number) => {
    setSelectedQualityLevel(levelIndex);
    if (hlsInstanceRef.current) {
      hlsInstanceRef.current.currentLevel = levelIndex;
    }
    setActivePanel(null);
  };

  const handleSelectSpeed = (rate: number) => {
    setPlaybackSpeed(rate);
    const videoEl = hlsVideoRef.current || directVideoRef.current;
    if (videoEl) {
      videoEl.playbackRate = rate;
    }
    setActivePanel(null);
  };

  const handleSkipSeconds = (deltaSeconds: number) => {
    const videoEl = hlsVideoRef.current || directVideoRef.current;
    if (!videoEl) return;
    videoEl.currentTime = Math.max(
      0,
      Math.min(videoEl.duration || Infinity, videoEl.currentTime + deltaSeconds)
    );
  };

  const handleTogglePiP = async () => {
    const videoEl = hlsVideoRef.current || directVideoRef.current;
    if (!videoEl) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoEl.requestPictureInPicture) {
        await videoEl.requestPictureInPicture();
      }
    } catch {
      // Ignore if PiP is not supported
    }
  };

  // Upload local .srt or .vtt subtitle file
  const handleUploadSubtitleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const rawText = typeof reader.result === 'string' ? reader.result : '';
      if (!rawText.trim()) return;

      let vttText = rawText.trim();
      if (!vttText.startsWith('WEBVTT')) {
        const converted = vttText
          .replace(/\r\n/g, '\n')
          .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');
        vttText = `WEBVTT\n\n${converted}`;
      }

      const blob = new Blob([vttText], { type: 'text/vtt;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      const cleanName = file.name.replace(/\.(srt|vtt)$/i, '');
      const newTrack: SubtitleTrackOption = {
        id: `custom-file-${Date.now()}`,
        label: `Custom · ${cleanName}`,
        lang: 'custom',
        url: blobUrl,
        isCustom: true,
      };

      setSubtitleTracks((prev) => [newTrack, ...prev]);
      setActiveSubtitleId(newTrack.id);
      setSubUploadFeedback(`Loaded "${file.name}"`);
      setTimeout(() => setSubUploadFeedback(null), 3000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Add custom subtitle by direct URL (.srt or .vtt)
  const handleAddSubtitleByUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const rawUrl = customSubUrlInput.trim();
    if (!rawUrl) return;

    const label = customSubLabelInput.trim() || 'Custom URL Subtitle';
    const proxiedUrl = `/api/subtitle-proxy?url=${encodeURIComponent(rawUrl)}`;
    const newTrack: SubtitleTrackOption = {
      id: `custom-url-${Date.now()}`,
      label: `Custom · ${label}`,
      lang: 'custom',
      url: proxiedUrl,
      isCustom: true,
    };

    setSubtitleTracks((prev) => [newTrack, ...prev]);
    setActiveSubtitleId(newTrack.id);
    setCustomSubUrlInput('');
    setCustomSubLabelInput('');
    setSubUploadFeedback(`Added "${label}"`);
    setTimeout(() => setSubUploadFeedback(null), 3000);
  };

  const handleRetry = () => {
    setPlaybackError(null);
    setIsLoading(true);
    setReloadKey((prev) => prev + 1);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const handleCopySourceUrl = async () => {
    try {
      await navigator.clipboard.writeText(media.originalUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      // Ignore
    }
  };

  const handleEnterContainerFullscreen = () => {
    const el = stageContainerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    }
  };

  const activeSubtitleTrack = useMemo(
    () => subtitleTracks.find((t) => t.id === activeSubtitleId) || null,
    [subtitleTracks, activeSubtitleId]
  );

  const currentQualityButtonLabel = useMemo(() => {
    if (selectedQualityLevel === -1) {
      return activePlayingHeight
        ? `Auto (${activePlayingHeight}p)`
        : 'Auto (HD)';
    }
    const found = qualityLevels.find((l) => l.index === selectedQualityLevel);
    return found ? `${found.height || ''}p` : 'Quality';
  }, [selectedQualityLevel, activePlayingHeight, qualityLevels]);

  if (
    media.status === 'embed_blocked' ||
    media.status === 'unsupported_provider'
  ) {
    return (
      <UnsupportedProviderMessage
        media={media}
        onBackHome={onBackHome}
        onPlayAnother={onPlayAnother}
        onSelectSampleUrl={onSelectSampleUrl}
      />
    );
  }

  const currentEmbedUrl = media.embedUrl;
  const currentDirectVideoUrl = media.directVideoUrl;

  const captionSizeClass =
    subtitleFontSize === 'sm'
      ? 'text-xs sm:text-sm'
      : subtitleFontSize === 'lg'
      ? 'text-base sm:text-xl md:text-2xl'
      : subtitleFontSize === 'xl'
      ? 'text-lg sm:text-2xl md:text-3xl'
      : 'text-sm sm:text-base md:text-lg';

  const attachedMovie = media.tmdbMovie;

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Hidden File Input for .SRT / .VTT Upload */}
      <input
        ref={subtitleFileInputRef}
        type="file"
        accept=".srt,.vtt,text/vtt,application/x-subrip"
        onChange={handleUploadSubtitleFile}
        className="hidden"
      />

      {/* Hidden File Input for Local Video Upload */}
      <input
        ref={localVideoInputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.mkv,.mov"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f || !onUploadLocalFileForMovie) return;
          const blobUrl = URL.createObjectURL(f);
          onUploadLocalFileForMovie(attachedMovie, blobUrl, f.name);
          e.target.value = '';
        }}
        className="hidden"
      />

      {/* Top Action Bar above Player */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <button
          type="button"
          onClick={onBackHome}
          className="px-3.5 py-2 text-xs sm:text-sm font-medium text-neutral-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] rounded-xl transition-colors inline-flex items-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discover</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleRetry}
            title="Reload player"
            className="p-2 text-xs font-medium text-neutral-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] rounded-xl transition-colors inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            aria-label="Reload player"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setAmbientLight((prev) => !prev)}
            title="Toggle ambient theatre glow"
            className={`px-3 py-2 text-xs font-medium rounded-xl border transition-colors inline-flex items-center gap-1.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
              ambientLight
                ? 'bg-amber-400/10 border-amber-400/30 text-amber-300'
                : 'bg-white/[0.03] border-white/[0.08] text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cinema Glow</span>
          </button>

          <button
            type="button"
            onClick={handleEnterContainerFullscreen}
            title="Toggle Theatre Fullscreen"
            className="px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] rounded-xl transition-colors inline-flex items-center gap-1.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fullscreen</span>
          </button>

          <button
            type="button"
            onClick={() => localVideoInputRef.current?.click()}
            className="px-3.5 py-2 text-xs font-medium text-neutral-200 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] rounded-xl transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
            title="Open a local video file (.mp4, .webm, .mkv) from your computer"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Open Local Video</span>
          </button>

          <button
            type="button"
            onClick={onPlayAnother}
            className="px-4 py-2 text-xs sm:text-sm font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors inline-flex items-center gap-2 whitespace-nowrap shadow-md shadow-amber-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Load Another URL</span>
          </button>
        </div>
      </div>

      {/* Main Player Stage or Playback Error */}
      {playbackError ? (
        <PlaybackError
          media={media}
          errorDetails={playbackError}
          onRetry={handleRetry}
          onEditUrl={onPlayAnother}
        />
      ) : (
        <div className="relative">
          {/* Subtle Ambient Cinema Backlight */}
          {ambientLight && (
            <div
              aria-hidden="true"
              className="absolute -inset-6 rounded-3xl opacity-30 blur-3xl pointer-events-none -z-10 transition-opacity duration-500"
              style={{
                background:
                  'radial-gradient(circle at 50% 45%, rgba(245, 158, 11, 0.28), rgba(99, 102, 241, 0.18) 55%, transparent 80%)',
              }}
            />
          )}

          {/* Responsive 16:9 Video Player Container */}
          <div
            ref={stageContainerRef}
            id="playspace-video-stage"
            className="group relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/[0.1] shadow-[0_24px_70px_rgba(0,0,0,0.75)] transition-all duration-300"
          >
            {/* Polished Loading Skeleton while player initializes */}
            {isLoading && (
              <div
                role="status"
                aria-live="polite"
                className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0c0c11]/90 text-neutral-300 p-6 pointer-events-none"
              >
                <div className="w-12 h-12 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin mb-4" />
                <p className="text-sm font-semibold text-white">
                  Initializing {media.title}…
                </p>
                <p className="text-xs text-neutral-400 mt-1 max-w-md text-center truncate">
                  {media.providerName}
                </p>
              </div>
            )}

            {/* Floating Top-Right Quick Controls Inside Video Stage (For HLS & Direct Video) */}
            {(currentHlsUrl || currentDirectVideoUrl) && (
              <div className="absolute top-3 right-3 z-30 flex flex-wrap items-center gap-1.5 opacity-95 sm:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 bg-black/75 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/[0.12]">
                {currentHlsUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      setActivePanel((prev) =>
                        prev === 'quality' ? null : 'quality'
                      )
                    }
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                      activePanel === 'quality'
                        ? 'bg-amber-400 text-neutral-950 font-bold'
                        : 'text-neutral-200 hover:bg-white/10'
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>{currentQualityButtonLabel}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setActivePanel((prev) =>
                      prev === 'subtitles' ? null : 'subtitles'
                    )
                  }
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                    activePanel === 'subtitles' || activeSubtitleId !== 'off'
                      ? 'bg-amber-400 text-neutral-950 font-bold'
                      : 'text-neutral-200 hover:bg-white/10'
                  }`}
                >
                  <Subtitles className="w-3.5 h-3.5" />
                  <span>
                    {activeSubtitleTrack
                      ? `CC: ${activeSubtitleTrack.label}`
                      : 'Subtitles (CC)'}
                  </span>
                </button>
              </div>
            )}

            {/* Custom High-Contrast Subtitle / Caption Overlay inside Stage */}
            {activeSubtitleId !== 'off' && currentCueText && (
              <div
                aria-live="off"
                className="absolute bottom-14 sm:bottom-16 left-4 right-4 z-20 flex justify-center pointer-events-none"
              >
                <div
                  className={`max-w-3xl px-3.5 py-1.5 rounded-lg bg-black/80 text-white font-medium text-center leading-snug whitespace-pre-line shadow-lg border border-white/10 ${captionSizeClass}`}
                >
                  {currentCueText}
                </div>
              </div>
            )}

            {/* In-Player Floating Popover: QUALITY SELECTOR */}
            {activePanel === 'quality' && (
              <div className="absolute top-14 right-3 z-40 w-72 rounded-2xl bg-[#101016]/95 backdrop-blur-xl border border-white/[0.14] shadow-2xl p-4 text-xs text-neutral-200">
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/[0.08]">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Settings className="w-3.5 h-3.5 text-amber-400" />
                    <span>HLS Stream Resolution</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setActivePanel(null)}
                    className="p-1 text-neutral-400 hover:text-white rounded-lg"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1 max-h-60 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => handleSelectQuality(-1)}
                    className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between transition-colors ${
                      selectedQualityLevel === -1
                        ? 'bg-amber-400 text-neutral-950 font-bold'
                        : 'hover:bg-white/[0.07] text-neutral-300'
                    }`}
                  >
                    <span>
                      Auto (Adaptive{' '}
                      {activePlayingHeight ? `· ${activePlayingHeight}p` : ''})
                    </span>
                    {selectedQualityLevel === -1 && (
                      <Check className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {qualityLevels.map((lvl) => (
                    <button
                      key={lvl.index}
                      type="button"
                      onClick={() => handleSelectQuality(lvl.index)}
                      className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between transition-colors ${
                        selectedQualityLevel === lvl.index
                          ? 'bg-amber-400 text-neutral-950 font-bold'
                          : 'hover:bg-white/[0.07] text-neutral-300'
                      }`}
                    >
                      <span>{lvl.label}</span>
                      <span className="text-[11px] font-mono opacity-75">
                        {lvl.bitrate
                          ? `${(lvl.bitrate / 1000000).toFixed(1)} Mbps`
                          : ''}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* In-Player Floating Popover: SUBTITLES & ADD CUSTOM SUBTITLE */}
            {activePanel === 'subtitles' && (
              <div className="absolute top-14 right-3 z-40 w-80 sm:w-96 max-h-[82%] flex flex-col rounded-2xl bg-[#101016]/95 backdrop-blur-xl border border-white/[0.14] shadow-2xl p-4 text-xs text-neutral-200">
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/[0.08] shrink-0">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Subtitles className="w-4 h-4 text-amber-400" />
                    <span>Custom Subtitles (.SRT / .VTT)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setActivePanel(null)}
                    className="p-1 text-neutral-400 hover:text-white rounded-lg"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Upload .SRT/.VTT or Add by URL */}
                <div className="mb-3 pb-3 border-b border-white/[0.08] space-y-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => subtitleFileInputRef.current?.click()}
                    className="w-full px-3 py-2 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/40 text-amber-300 font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload .SRT / .VTT Subtitle File</span>
                  </button>

                  <form
                    onSubmit={handleAddSubtitleByUrl}
                    className="flex items-center gap-1.5"
                  >
                    <input
                      type="url"
                      value={customSubUrlInput}
                      onChange={(e) => setCustomSubUrlInput(e.target.value)}
                      placeholder="Or paste .vtt / .srt URL…"
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/[0.1] text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 text-[11px]"
                    />
                    <button
                      type="submit"
                      className="px-2.5 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-white font-medium inline-flex items-center gap-1 shrink-0 text-[11px]"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add URL</span>
                    </button>
                  </form>

                  {subUploadFeedback && (
                    <p className="text-[11px] text-emerald-400 font-medium">
                      {subUploadFeedback}
                    </p>
                  )}

                  {/* Caption Size & Timing Offset Controls */}
                  <div className="flex items-center justify-between gap-2 pt-1 text-[11px] text-neutral-400">
                    <div className="flex items-center gap-1">
                      <span>Size:</span>
                      {(['sm', 'md', 'lg', 'xl'] as const).map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSubtitleFontSize(sz)}
                          className={`px-1.5 py-0.5 rounded uppercase font-mono ${
                            subtitleFontSize === sz
                              ? 'bg-amber-400 text-neutral-950 font-bold'
                              : 'bg-white/[0.05] text-neutral-400 hover:text-white'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1 font-mono">
                      <span>Sync:</span>
                      <button
                        type="button"
                        onClick={() =>
                          setSubtitleOffsetSec(
                            (s) => Math.round((s - 0.5) * 10) / 10
                          )
                        }
                        className="px-1.5 py-0.5 rounded bg-white/[0.06] hover:bg-white/[0.12] text-white"
                      >
                        -0.5s
                      </button>
                      <span className="text-neutral-200 min-w-[3ch] text-center">
                        {subtitleOffsetSec > 0
                          ? `+${subtitleOffsetSec}s`
                          : `${subtitleOffsetSec}s`}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setSubtitleOffsetSec(
                            (s) => Math.round((s + 0.5) * 10) / 10
                          )
                        }
                        className="px-1.5 py-0.5 rounded bg-white/[0.06] hover:bg-white/[0.12] text-white"
                      >
                        +0.5s
                      </button>
                    </div>
                  </div>
                </div>

                {/* Subtitle Track List */}
                <div className="space-y-1 overflow-y-auto flex-1 pr-1 max-h-48">
                  <button
                    type="button"
                    onClick={() => setActiveSubtitleId('off')}
                    className={`w-full px-3 py-1.5 rounded-xl text-left flex items-center justify-between transition-colors ${
                      activeSubtitleId === 'off'
                        ? 'bg-amber-400 text-neutral-950 font-bold'
                        : 'hover:bg-white/[0.07] text-neutral-300'
                    }`}
                  >
                    <span>Off (No Subtitles)</span>
                    {activeSubtitleId === 'off' && (
                      <Check className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {subtitleTracks.map((track) => (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => setActiveSubtitleId(track.id)}
                      className={`w-full px-3 py-1.5 rounded-xl text-left flex items-center justify-between transition-colors ${
                        activeSubtitleId === track.id
                          ? 'bg-amber-400 text-neutral-950 font-bold'
                          : 'hover:bg-white/[0.07] text-neutral-300'
                      }`}
                    >
                      <span className="truncate">{track.label}</span>
                      {activeSubtitleId === track.id && (
                        <Check className="w-3.5 h-3.5 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* In-Player Floating Popover: PLAYBACK SPEED */}
            {activePanel === 'speed' && (
              <div className="absolute top-14 right-3 z-40 w-52 rounded-2xl bg-[#101016]/95 backdrop-blur-xl border border-white/[0.14] shadow-2xl p-3.5 text-xs text-neutral-200">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.08]">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-amber-400" />
                    <span>Playback Speed</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setActivePanel(null)}
                    className="p-1 text-neutral-400 hover:text-white rounded-lg"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => handleSelectSpeed(rate)}
                      className={`px-2.5 py-1.5 rounded-lg font-mono text-center transition-colors ${
                        playbackSpeed === rate
                          ? 'bg-amber-400 text-neutral-950 font-bold'
                          : 'bg-white/[0.04] hover:bg-white/[0.1] text-neutral-300'
                      }`}
                    >
                      {rate === 1 ? '1x (Normal)' : `${rate}x`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 1. Native HLS (<video> + hls.js) Player for User .M3U8 Streams */}
            {currentHlsUrl && (
              <video
                ref={hlsVideoRef}
                key={`hls-${currentHlsUrl}-${reloadKey}`}
                controls
                autoPlay
                playsInline
                crossOrigin="anonymous"
                poster={attachedMovie?.backdropUrl}
                className="w-full h-full object-contain bg-black"
                onCanPlay={() => setIsLoading(false)}
                onPlaying={() => setIsLoading(false)}
              />
            )}

            {/* 2. Official Embedded Iframe Player (for YouTube Trailers, YouTube Videos, Vimeo, etc.) */}
            {currentEmbedUrl && !currentHlsUrl && (
              <iframe
                key={`${currentEmbedUrl}-${reloadKey}`}
                src={currentEmbedUrl}
                title={media.title || `${media.providerName} Embedded Player`}
                className="w-full h-full border-0 bg-black"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setPlaybackError(
                    `Failed to load the ${media.providerName} stream.`
                  );
                }}
              />
            )}

            {/* 3. Standard HTML5 Video Player for Direct MP4 / WebM / Local Uploaded Files */}
            {currentDirectVideoUrl && !currentHlsUrl && !currentEmbedUrl && (
              <video
                ref={directVideoRef}
                key={`${currentDirectVideoUrl}-${reloadKey}`}
                src={currentDirectVideoUrl}
                controls
                autoPlay
                playsInline
                poster={attachedMovie?.backdropUrl}
                className="w-full h-full object-contain bg-black"
                onLoadedData={() => setIsLoading(false)}
                onCanPlay={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setPlaybackError(
                    'The direct video file could not be decoded or reached.'
                  );
                }}
              >
                Your browser does not support native HTML5 video playback.
              </video>
            )}
          </div>

          {/* Dedicated Player Control Bar for HLS, Direct Video & Local Video Files */}
          {(currentHlsUrl || currentDirectVideoUrl) && (
            <div className="mt-3 px-4 py-3 rounded-2xl bg-[#111218] border border-white/[0.09] flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSkipSeconds(-10)}
                  className="px-2.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-medium text-neutral-300 hover:text-white inline-flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="font-mono">-10s</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSkipSeconds(10)}
                  className="px-2.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-medium text-neutral-300 hover:text-white inline-flex items-center gap-1 transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span className="font-mono">+10s</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActivePanel((prev) =>
                      prev === 'speed' ? null : 'speed'
                    )
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 transition-colors ${
                    activePanel === 'speed' || playbackSpeed !== 1
                      ? 'bg-amber-400/20 border border-amber-400/40 text-amber-300'
                      : 'bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 hover:text-white'
                  }`}
                >
                  <Gauge className="w-3.5 h-3.5" />
                  <span className="font-mono">Speed: {playbackSpeed}x</span>
                </button>

                <button
                  type="button"
                  onClick={handleTogglePiP}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-medium text-neutral-300 hover:text-white inline-flex items-center gap-1.5 transition-colors"
                >
                  <PictureInPicture2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">PiP</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {currentHlsUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      setActivePanel((prev) =>
                        prev === 'quality' ? null : 'quality'
                      )
                    }
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors border ${
                      activePanel === 'quality'
                        ? 'bg-amber-400 border-amber-400 text-neutral-950'
                        : 'bg-white/[0.06] hover:bg-white/[0.12] border-white/[0.08] text-white'
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5 text-amber-400" />
                    <span>Quality: {currentQualityButtonLabel}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setActivePanel((prev) =>
                      prev === 'subtitles' ? null : 'subtitles'
                    )
                  }
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors border ${
                    activePanel === 'subtitles' || activeSubtitleId !== 'off'
                      ? 'bg-amber-400 border-amber-400 text-neutral-950'
                      : 'bg-white/[0.06] hover:bg-white/[0.12] border-white/[0.08] text-white'
                  }`}
                >
                  <Subtitles className="w-3.5 h-3.5" />
                  <span>
                    {activeSubtitleTrack
                      ? `Subtitles: ${activeSubtitleTrack.label}`
                      : `Subtitles (${subtitleTracks.length})`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => subtitleFileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-neutral-200 hover:text-white inline-flex items-center gap-1.5 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Upload .SRT / .VTT</span>
                </button>
              </div>
            </div>
          )}

          {/* Media Metadata & Attribution Deck below Player */}
          <div className="mt-5 p-5 rounded-2xl bg-[#101118] border border-white/[0.08] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-1.5">
                <PlatformBadge
                  provider={media.provider}
                  label={media.providerName}
                  subtitle={media.subtitle}
                />
              </div>

              <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight truncate">
                {media.title}
              </h1>

              {attachedMovie && (
                <p className="text-xs text-neutral-400 mt-1 line-clamp-2 max-w-3xl">
                  {attachedMovie.overview}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {attachedMovie &&
                media.playbackMode === 'custom_stream' &&
                onWatchMovieTrailer && (
                  <button
                    type="button"
                    onClick={() => onWatchMovieTrailer(attachedMovie)}
                    className="px-3.5 py-2 text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 rounded-xl transition-colors inline-flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Switch to Official Trailer</span>
                  </button>
                )}

              {media.provider !== 'local_file' && (
                <button
                  type="button"
                  onClick={handleCopySourceUrl}
                  className="px-3.5 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] rounded-xl transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
                >
                  {copiedUrl ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Link Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Stream URL</span>
                    </>
                  )}
                </button>
              )}

              {media.externalActionUrl && (
                <a
                  href={media.externalActionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 text-xs font-medium text-neutral-200 hover:text-white bg-white/[0.08] hover:bg-white/[0.14] rounded-xl transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>Open Source Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* If watching a TMDB movie trailer, offer instant "Stream Custom URL / File for This Movie" + Similar Movie Recommendations */}
          {attachedMovie && (
            <div className="mt-6 space-y-6">
              {/* Attach Custom Stream URL to this Movie */}
              {onAttachCustomUrlToMovie && (
                <div className="p-5 rounded-2xl bg-[#101118] border border-white/[0.08] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-mono uppercase tracking-wider text-amber-400">
                      Bring Your Own Stream · {attachedMovie.title} (
                      {attachedMovie.year})
                    </div>
                    <h2 className="text-sm sm:text-base font-bold text-white">
                      Have a stream URL or local file for {attachedMovie.title}?
                    </h2>
                    <p className="text-xs text-neutral-400">
                      Paste any YouTube URL, adaptive .m3u8 HLS link, or direct
                      .mp4 URL—or open a local video file from your device.
                    </p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!movieCustomUrlInput.trim()) return;
                      onAttachCustomUrlToMovie(
                        attachedMovie,
                        movieCustomUrlInput.trim()
                      );
                      setMovieCustomUrlInput('');
                    }}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto lg:min-w-[440px]"
                  >
                    <input
                      type="text"
                      value={movieCustomUrlInput}
                      onChange={(e) => setMovieCustomUrlInput(e.target.value)}
                      placeholder="Paste YouTube, .m3u8, or .mp4 URL…"
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/70 border border-white/[0.12] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs inline-flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Play URL</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => localVideoInputRef.current?.click()}
                      className="px-3.5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-neutral-200 font-medium text-xs inline-flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Local File</span>
                    </button>
                  </form>
                </div>
              )}

              {/* TMDB Similar Movie Recommendations */}
              {similarMovies.length > 0 && onWatchMovieTrailer && (
                <div className="p-6 rounded-2xl bg-[#101118] border border-white/[0.08] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-mono uppercase tracking-wider text-amber-400">
                        TMDB Recommendations
                      </p>
                      <h3 className="text-base sm:text-lg font-bold text-white">
                        Recommended Movies Similar to {attachedMovie.title}
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
                    {similarMovies.map((sim) => (
                      <button
                        key={sim.id}
                        type="button"
                        onClick={() => onWatchMovieTrailer(sim)}
                        className="group text-left rounded-xl bg-[#151620] border border-white/[0.07] hover:border-amber-400/50 overflow-hidden flex flex-col justify-between transition-all"
                      >
                        <div className="relative aspect-[2/3] w-full bg-black overflow-hidden flex items-center justify-center">
                          {sim.posterUrl ? (
                            <img
                              src={sim.posterUrl}
                              alt={sim.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <Film className="w-6 h-6 text-neutral-500" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center shadow-lg">
                              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                            </div>
                          </div>
                        </div>
                        <div className="p-2.5">
                          <div className="text-xs font-bold text-white truncate group-hover:text-amber-400">
                            {sim.title}
                          </div>
                          <div className="text-[10px] font-mono text-neutral-400 mt-0.5 flex items-center justify-between">
                            <span>{sim.year}</span>
                            <span className="text-amber-400">
                              ★ {sim.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
