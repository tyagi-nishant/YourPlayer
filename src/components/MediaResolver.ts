import { ResolvedMedia, SampleMediaPreset, TmdbMovie } from '../types';

const KNOWN_MEDIA_TITLES: Record<string, { title: string; subtitle: string }> = {
  'Way9Dexny3w': {
    title: 'Dune: Part Two — Official Trailer',
    subtitle: 'Warner Bros. Pictures · YouTube Official Trailer',
  },
  'uYPbbksJxIg': {
    title: 'Oppenheimer — New Trailer',
    subtitle: 'Universal Pictures · YouTube Official Trailer',
  },
  'uhUht6vAsMY': {
    title: 'Superman (2025) — Official Teaser Trailer',
    subtitle: 'DC Studios · YouTube Official Trailer',
  },
  'NOhDyUmT9z0': {
    title: 'Mission: Impossible – The Final Reckoning — Official Trailer',
    subtitle: 'Paramount Pictures · YouTube Official Trailer',
  },
  'aqz-KE-bpKQ': {
    title: 'Big Buck Bunny 60fps 4K — Blender Open Movie',
    subtitle: 'Blender Foundation · YouTube 4K Stream',
  },
  'Tn6-PIqc4UM': {
    title: 'React in 100 Seconds',
    subtitle: 'Fireship · YouTube',
  },
  '76979871': {
    title: 'The New Vimeo Player — Official Showcase',
    subtitle: 'Vimeo Staff · Vimeo',
  },
};

const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtu.be',
  'www.youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
]);

const VIMEO_HOSTS = new Set([
  'vimeo.com',
  'www.vimeo.com',
  'player.vimeo.com',
]);

const DAILYMOTION_HOSTS = new Set([
  'dailymotion.com',
  'www.dailymotion.com',
  'dai.ly',
]);

const STREAMABLE_HOSTS = new Set([
  'streamable.com',
  'www.streamable.com',
]);

const ARCHIVE_HOSTS = new Set([
  'archive.org',
  'www.archive.org',
]);

const NETFLIX_HOSTS = new Set([
  'netflix.com',
  'www.netflix.com',
]);

const DIRECT_VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov', '.mkv'];
const HLS_VIDEO_EXTENSIONS = ['.m3u8'];

const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;
const VIMEO_ID_REGEX = /^\d{6,12}$/;
const DAILYMOTION_ID_REGEX = /^[a-zA-Z0-9]{5,12}$/;

/**
 * Extracts one or more URLs if the user pastes multiple links separated by spaces or newlines.
 */
export function extractUrlsFromInput(rawInput: string): string[] {
  const trimmed = rawInput.trim();
  if (!trimmed) return [];

  const matches = trimmed.match(/https?:\/\/[^\s,;"'<>]+/gi);
  if (matches && matches.length > 0) {
    return matches;
  }
  return [trimmed];
}

/**
 * Helper to create a ResolvedMedia object for a TMDB Movie's official YouTube trailer.
 */
export function createTrailerMediaForMovie(
  movie: TmdbMovie,
  youtubeTrailerId: string
): ResolvedMedia {
  const cleanId = youtubeTrailerId.trim() || movie.youtubeTrailerId || 'Way9Dexny3w';
  const watchUrl = `https://www.youtube.com/watch?v=${cleanId}`;
  const embedParams = new URLSearchParams({
    autoplay: '1',
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  });

  return {
    status: 'playable',
    provider: 'youtube',
    providerName: 'YouTube Official Trailer',
    originalUrl: watchUrl,
    normalizedUrl: watchUrl,
    mediaId: cleanId,
    embedUrl: `https://www.youtube.com/embed/${cleanId}?${embedParams.toString()}`,
    thumbnailUrl: movie.backdropUrl || `https://i.ytimg.com/vi/${cleanId}/hqdefault.jpg`,
    title: `${movie.title} (${movie.year}) — Official Trailer`,
    subtitle: `${movie.genres.join(' / ')} · Directed by ${movie.director} · ★ ${movie.rating.toFixed(1)}`,
    externalActionUrl: watchUrl,
    tmdbMovie: movie,
    playbackMode: 'trailer',
  };
}

/**
 * Strictly validates and resolves a user-supplied media URL into a structured playback descriptor.
 */
export function resolveMediaUrl(
  rawInput: string,
  attachedMovie?: TmdbMovie,
  useCorsProxyForHls = false
): ResolvedMedia {
  const extractedList = extractUrlsFromInput(rawInput);
  const trimmed = (extractedList[0] || rawInput).trim();

  if (!trimmed) {
    return {
      status: 'invalid_url',
      provider: 'unsupported',
      providerName: 'Unknown',
      originalUrl: rawInput,
      normalizedUrl: '',
      title: 'Empty URL',
      errorMessage: 'Please paste a YouTube, HLS (.m3u8), MP4, or Vimeo URL to start watching.',
    };
  }

  // Allow local blob URLs created from user file uploads
  if (trimmed.startsWith('blob:')) {
    return {
      status: 'playable',
      provider: 'local_file',
      providerName: 'Local Video File',
      originalUrl: trimmed,
      normalizedUrl: trimmed,
      directVideoUrl: trimmed,
      title: attachedMovie
        ? `${attachedMovie.title} (${attachedMovie.year}) — Custom File`
        : 'Local Uploaded Movie File',
      subtitle: 'HTML5 Direct Local Playback · Zero Upload Latency',
      tmdbMovie: attachedMovie,
      playbackMode: 'custom_stream',
    };
  }

  // Block dangerous schemes early
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return {
      status: 'invalid_url',
      provider: 'unsupported',
      providerName: 'Blocked Scheme',
      originalUrl: trimmed,
      normalizedUrl: '',
      title: 'Unsafe URL Blocked',
      errorMessage: 'Only secure HTTPS media URLs or local video files are permitted.',
    };
  }

  // If the user pasted an 11-character YouTube Video ID directly
  if (YOUTUBE_ID_REGEX.test(trimmed)) {
    const ytUrl = new URL(`https://www.youtube.com/watch?v=${trimmed}`);
    const res = resolveYouTubeAdapter(ytUrl, `https://www.youtube.com/watch?v=${trimmed}`);
    if (attachedMovie) {
      res.tmdbMovie = attachedMovie;
      res.title = `${attachedMovie.title} (${attachedMovie.year}) — Custom Stream`;
      res.playbackMode = 'custom_stream';
    }
    return res;
  }

  const looksLikeDomain =
    !/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed) &&
    /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(trimmed) &&
    !trimmed.includes(' ');

  const candidateUrlString = looksLikeDomain ? `https://${trimmed}` : trimmed;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(candidateUrlString);
  } catch {
    return {
      status: 'invalid_url',
      provider: 'unsupported',
      providerName: 'Invalid Format',
      originalUrl: trimmed,
      normalizedUrl: '',
      title: 'Invalid Media URL',
      errorMessage:
        'Please paste a valid HTTPS video URL (YouTube, .m3u8 HLS stream, .mp4 direct video, or Vimeo).',
    };
  }

  const isLocalDev =
    parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1';

  if (
    parsedUrl.protocol !== 'https:' &&
    !(isLocalDev && parsedUrl.protocol === 'http:')
  ) {
    return {
      status: 'invalid_url',
      provider: 'unsupported',
      providerName: 'Insecure Protocol',
      originalUrl: trimmed,
      normalizedUrl: parsedUrl.toString(),
      title: 'HTTPS Required',
      errorMessage: 'For security, PlaySpace only accepts encrypted HTTPS media links.',
    };
  }

  if (parsedUrl.username || parsedUrl.password) {
    return {
      status: 'invalid_url',
      provider: 'unsupported',
      providerName: 'Security Policy',
      originalUrl: trimmed,
      normalizedUrl: '',
      title: 'Credentials Not Permitted in URL',
      errorMessage: 'PlaySpace never accepts URLs containing usernames, passwords, or tokens.',
    };
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  // 1. YouTube Provider Adapter
  if (YOUTUBE_HOSTS.has(hostname)) {
    const resolved = resolveYouTubeAdapter(parsedUrl, trimmed);
    if (attachedMovie) {
      resolved.tmdbMovie = attachedMovie;
      resolved.title = `${attachedMovie.title} (${attachedMovie.year}) — YouTube Stream`;
      resolved.playbackMode = 'custom_stream';
    }
    return resolved;
  }

  // 2. Netflix Provider Adapter (Recognized DRM platform)
  if (NETFLIX_HOSTS.has(hostname)) {
    return resolveNetflixAdapter(parsedUrl, trimmed);
  }

  // 3. Vimeo Provider Adapter
  if (VIMEO_HOSTS.has(hostname)) {
    const resolved = resolveVimeoAdapter(parsedUrl, trimmed);
    if (attachedMovie) {
      resolved.tmdbMovie = attachedMovie;
      resolved.playbackMode = 'custom_stream';
    }
    return resolved;
  }

  // 4. Dailymotion Provider Adapter
  if (DAILYMOTION_HOSTS.has(hostname)) {
    const resolved = resolveDailymotionAdapter(parsedUrl, trimmed);
    if (attachedMovie) {
      resolved.tmdbMovie = attachedMovie;
      resolved.playbackMode = 'custom_stream';
    }
    return resolved;
  }

  // 5. Streamable Provider Adapter
  if (STREAMABLE_HOSTS.has(hostname)) {
    return resolveStreamableAdapter(parsedUrl, trimmed);
  }

  // 6. Internet Archive Provider Adapter
  if (ARCHIVE_HOSTS.has(hostname)) {
    return resolveArchiveAdapter(parsedUrl, trimmed);
  }

  const pathnameLower = parsedUrl.pathname.toLowerCase();
  const fullUrlLower = parsedUrl.toString().toLowerCase();

  // 7. HLS (.m3u8) Adaptive Stream Adapter
  if (
    HLS_VIDEO_EXTENSIONS.some((ext) => pathnameLower.endsWith(ext)) ||
    fullUrlLower.includes('.m3u8')
  ) {
    const rawHlsUrl = parsedUrl.toString();
    const effectiveHlsUrl = useCorsProxyForHls
      ? `/api/hls-proxy?url=${encodeURIComponent(rawHlsUrl)}`
      : rawHlsUrl;

    const fileName =
      decodeURIComponent(parsedUrl.pathname.split('/').pop() || 'HLS Stream')
        .replace(/\.m3u8$/i, '')
        .replace(/[-_]+/g, ' ') || 'Adaptive HLS Stream';

    return {
      status: 'playable',
      provider: 'hls',
      providerName: 'HLS Adaptive Stream (.m3u8)',
      originalUrl: trimmed,
      normalizedUrl: rawHlsUrl,
      hlsUrl: effectiveHlsUrl,
      title: attachedMovie
        ? `${attachedMovie.title} (${attachedMovie.year}) — Custom HLS Stream`
        : fileName,
      subtitle: `${parsedUrl.hostname} · Multi-Bitrate HLS Player`,
      externalActionUrl: rawHlsUrl,
      tmdbMovie: attachedMovie,
      playbackMode: 'custom_stream',
    };
  }

  // 8. Direct HTML5 Video File Adapter (.mp4, .webm, .ogg, .mov, .mkv)
  const matchedExt = DIRECT_VIDEO_EXTENSIONS.find((ext) =>
    pathnameLower.endsWith(ext)
  );
  if (matchedExt) {
    const fileName =
      decodeURIComponent(
        parsedUrl.pathname.split('/').pop() || 'Direct Video Stream'
      )
        .replace(/\.(mp4|webm|ogg|mov|mkv)$/i, '')
        .replace(/[-_]+/g, ' ') || 'Direct HTML5 Video';

    return {
      status: 'playable',
      provider: 'direct',
      providerName: `Direct Video (${matchedExt.replace('.', '').toUpperCase()})`,
      originalUrl: trimmed,
      normalizedUrl: parsedUrl.toString(),
      directVideoUrl: parsedUrl.toString(),
      title: attachedMovie
        ? `${attachedMovie.title} (${attachedMovie.year}) — Direct Stream`
        : fileName,
      subtitle: `${parsedUrl.hostname} · HTML5 Native Stream`,
      externalActionUrl: parsedUrl.toString(),
      tmdbMovie: attachedMovie,
      playbackMode: 'custom_stream',
    };
  }

  // 9. Custom Embed / External Video URL
  const cleanHost = parsedUrl.hostname.replace(/^www\./i, '');
  return {
    status: 'playable',
    provider: 'web_embed',
    providerName: `Custom Embed (${cleanHost})`,
    originalUrl: trimmed,
    normalizedUrl: parsedUrl.toString(),
    embedUrl: parsedUrl.toString(),
    title: attachedMovie
      ? `${attachedMovie.title} (${attachedMovie.year}) — Custom Stream`
      : `Custom Stream · ${cleanHost}`,
    subtitle: `${cleanHost} · User Provided Stream URL`,
    externalActionUrl: parsedUrl.toString(),
    tmdbMovie: attachedMovie,
    playbackMode: 'custom_stream',
  };
}

function resolveYouTubeAdapter(url: URL, originalUrl: string): ResolvedMedia {
  const host = url.hostname.toLowerCase();
  const pathSegments = url.pathname.split('/').filter(Boolean);
  let videoId: string | null = null;
  let isShort = false;

  if (host === 'youtu.be' || host === 'www.youtu.be') {
    videoId = pathSegments[0] || null;
  } else if (url.pathname === '/watch') {
    videoId = url.searchParams.get('v');
  } else if (
    pathSegments[0] === 'embed' ||
    pathSegments[0] === 'shorts' ||
    pathSegments[0] === 'live' ||
    pathSegments[0] === 'v'
  ) {
    isShort = pathSegments[0] === 'shorts';
    videoId = pathSegments[1] || null;
  }

  if (!videoId || !YOUTUBE_ID_REGEX.test(videoId)) {
    return {
      status: 'invalid_url',
      provider: 'youtube',
      providerName: 'YouTube',
      originalUrl,
      normalizedUrl: url.toString(),
      title: 'Invalid YouTube Link',
      errorMessage:
        'Could not find a valid 11-character YouTube video ID. Supported formats include youtube.com/watch?v=ID, youtu.be/ID, and youtube.com/shorts/ID.',
    };
  }

  const rawTime = url.searchParams.get('t') || url.searchParams.get('start');
  let startSeconds = 0;
  if (rawTime) {
    const parsedTime = parseInt(rawTime.replace(/s$/i, ''), 10);
    if (!Number.isNaN(parsedTime) && parsedTime > 0) {
      startSeconds = parsedTime;
    }
  }

  const embedParams = new URLSearchParams({
    autoplay: '1',
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  });
  if (startSeconds > 0) {
    embedParams.set('start', String(startSeconds));
  }

  const known = KNOWN_MEDIA_TITLES[videoId];

  return {
    status: 'playable',
    provider: 'youtube',
    providerName: isShort ? 'YouTube Shorts' : 'YouTube',
    originalUrl,
    normalizedUrl: `https://www.youtube.com/watch?v=${videoId}`,
    mediaId: videoId,
    embedUrl: `https://www.youtube.com/embed/${videoId}?${embedParams.toString()}`,
    thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    isShort,
    title: known
      ? known.title
      : isShort
      ? `YouTube Short · ${videoId}`
      : `YouTube Video · ${videoId}`,
    subtitle: known ? known.subtitle : `Video ID: ${videoId}`,
    externalActionUrl: `https://www.youtube.com/watch?v=${videoId}`,
  };
}

function resolveVimeoAdapter(url: URL, originalUrl: string): ResolvedMedia {
  const segments = url.pathname.split('/').filter(Boolean);
  let videoId: string | null = null;

  if (url.hostname === 'player.vimeo.com' && segments[0] === 'video') {
    videoId = segments[1] || null;
  } else if (segments.length > 0) {
    const lastSegment = segments[segments.length - 1];
    if (VIMEO_ID_REGEX.test(lastSegment)) {
      videoId = lastSegment;
    }
  }

  if (!videoId || !VIMEO_ID_REGEX.test(videoId)) {
    return {
      status: 'invalid_url',
      provider: 'vimeo',
      providerName: 'Vimeo',
      originalUrl,
      normalizedUrl: url.toString(),
      title: 'Invalid Vimeo URL',
      errorMessage:
        'Could not extract a valid numeric Vimeo ID. Use a link like https://vimeo.com/76979871.',
    };
  }

  const known = KNOWN_MEDIA_TITLES[videoId];

  return {
    status: 'playable',
    provider: 'vimeo',
    providerName: 'Vimeo',
    originalUrl,
    normalizedUrl: `https://vimeo.com/${videoId}`,
    mediaId: videoId,
    embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=1&title=0&byline=0&portrait=0&dnt=1`,
    title: known ? known.title : `Vimeo Showcase · ${videoId}`,
    subtitle: known ? known.subtitle : `Vimeo ID: ${videoId}`,
    externalActionUrl: `https://vimeo.com/${videoId}`,
  };
}

function resolveDailymotionAdapter(url: URL, originalUrl: string): ResolvedMedia {
  const segments = url.pathname.split('/').filter(Boolean);
  let videoId: string | null = null;

  if (url.hostname === 'dai.ly') {
    videoId = segments[0] || null;
  } else if (segments[0] === 'video' && segments[1]) {
    videoId = segments[1].split('_')[0];
  } else if (segments[0] === 'embed' && segments[1] === 'video' && segments[2]) {
    videoId = segments[2];
  }

  if (!videoId || !DAILYMOTION_ID_REGEX.test(videoId)) {
    return {
      status: 'invalid_url',
      provider: 'dailymotion',
      providerName: 'Dailymotion',
      originalUrl,
      normalizedUrl: url.toString(),
      title: 'Invalid Dailymotion URL',
      errorMessage:
        'Could not extract a valid Dailymotion video ID. Expected format: https://www.dailymotion.com/video/VIDEO_ID.',
    };
  }

  return {
    status: 'playable',
    provider: 'dailymotion',
    providerName: 'Dailymotion',
    originalUrl,
    normalizedUrl: `https://www.dailymotion.com/video/${videoId}`,
    mediaId: videoId,
    embedUrl: `https://www.dailymotion.com/embed/video/${videoId}?autoplay=1`,
    title: `Dailymotion Stream · ${videoId}`,
    subtitle: `Dailymotion ID: ${videoId}`,
    externalActionUrl: `https://www.dailymotion.com/video/${videoId}`,
  };
}

function resolveStreamableAdapter(url: URL, originalUrl: string): ResolvedMedia {
  const segments = url.pathname.split('/').filter(Boolean);
  const videoId = segments[segments.length - 1];
  return {
    status: 'playable',
    provider: 'streamable',
    providerName: 'Streamable',
    originalUrl,
    normalizedUrl: `https://streamable.com/${videoId || ''}`,
    mediaId: videoId,
    embedUrl: `https://streamable.com/e/${videoId || ''}?autoplay=1`,
    title: `Streamable Clip · ${videoId || 'Stream'}`,
    subtitle: `Streamable ID: ${videoId || 'Clip'}`,
    externalActionUrl: `https://streamable.com/${videoId || ''}`,
  };
}

function resolveArchiveAdapter(url: URL, originalUrl: string): ResolvedMedia {
  const segments = url.pathname.split('/').filter(Boolean);
  const itemId = segments[1] || segments[0] || 'media';
  return {
    status: 'playable',
    provider: 'archive',
    providerName: 'Internet Archive',
    originalUrl,
    normalizedUrl: `https://archive.org/details/${itemId}`,
    mediaId: itemId,
    embedUrl: `https://archive.org/embed/${itemId}?autoplay=1`,
    title: `Internet Archive · ${itemId.replace(/[-_]+/g, ' ')}`,
    subtitle: 'archive.org · Public Media',
    externalActionUrl: `https://archive.org/details/${itemId}`,
  };
}

function resolveNetflixAdapter(url: URL, originalUrl: string): ResolvedMedia {
  const segments = url.pathname.split('/').filter(Boolean);
  let titleId: string | undefined;

  if ((segments[0] === 'watch' || segments[0] === 'title') && segments[1]) {
    titleId = segments[1].replace(/\D/g, '') || segments[1];
  }

  const canonicalUrl = titleId
    ? `https://www.netflix.com/title/${titleId}`
    : url.toString();

  return {
    status: 'embed_blocked',
    provider: 'netflix',
    originalUrl,
    normalizedUrl: canonicalUrl,
    providerName: 'Netflix',
    mediaId: titleId,
    title: titleId ? `Netflix Title #${titleId}` : 'Netflix Protected Stream',
    subtitle: 'DRM & Frame Security Policy',
    reason:
      'Netflix protects its catalog with Widevine/PlayReady DRM and strict Cross-Origin framing policies (X-Frame-Options: DENY). Third-party websites cannot embed Netflix streams inside an iframe, and PlaySpace never asks for account credentials or bypasses DRM.',
    externalActionUrl: url.toString(),
  };
}

/**
 * Fetches public oEmbed metadata (title, author, thumbnail) for supported platforms
 * without requiring API keys or blocking initial playback.
 */
export async function fetchPublicMediaMetadata(
  resolved: ResolvedMedia
): Promise<{ title?: string; subtitle?: string; thumbnailUrl?: string } | null> {
  if (resolved.status !== 'playable') return null;
  if (resolved.tmdbMovie) return null;
  if (resolved.provider !== 'youtube' && resolved.provider !== 'vimeo') return null;

  try {
    const endpoint = `https://noembed.com/embed?url=${encodeURIComponent(
      resolved.normalizedUrl
    )}`;
    const response = await fetch(endpoint);
    if (!response.ok) return null;
    const data = await response.json();
    if (data && typeof data.title === 'string' && data.title.trim()) {
      return {
        title: data.title.trim(),
        subtitle: data.author_name
          ? `${data.author_name} · ${resolved.providerName}`
          : resolved.subtitle,
        thumbnailUrl:
          typeof data.thumbnail_url === 'string'
            ? data.thumbnail_url
            : resolved.thumbnailUrl,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export const SAMPLE_MEDIA_PRESETS: SampleMediaPreset[] = [
  {
    id: 'preset-dune-trailer',
    label: 'Dune: Part Two Trailer',
    providerName: 'YouTube Trailer',
    provider: 'youtube',
    url: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    description: 'Dune: Part Two — Official 4K Theatrical Trailer',
    thumbnailUrl: 'https://i.ytimg.com/vi/Way9Dexny3w/hqdefault.jpg',
    duration: '03:02',
  },
  {
    id: 'preset-superman-trailer',
    label: 'Superman (2025) Trailer',
    providerName: 'YouTube Trailer',
    provider: 'youtube',
    url: 'https://www.youtube.com/watch?v=uhUht6vAsMY',
    description: 'Superman (2025) — Official Teaser Trailer',
    thumbnailUrl: 'https://i.ytimg.com/vi/uhUht6vAsMY/hqdefault.jpg',
    duration: '02:20',
  },
  {
    id: 'preset-hls-tears',
    label: '4K Adaptive HLS (.m3u8)',
    providerName: 'HLS Stream',
    provider: 'hls',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    description: 'Multi-Bitrate Adaptive HLS Stream with Quality Selector',
    duration: '10:35',
  },
  {
    id: 'preset-direct-mp4',
    label: 'Direct Sci-Fi Short (MP4)',
    providerName: 'MP4 Video',
    provider: 'direct',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    description: 'Tears of Steel — Blender Open Sci-Fi Film (Direct MP4)',
    duration: '12:14',
  },
];
