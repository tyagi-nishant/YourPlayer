import React, { useState, useRef } from 'react';
import {
  Link2,
  Play,
  ClipboardPaste,
  X,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Upload,
  ShieldCheck,
} from 'lucide-react';

interface UrlInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: (urlToPlay: string, useCorsProxy?: boolean) => void;
  onUploadLocalVideo?: (blobUrl: string, fileName: string) => void;
  isValidating: boolean;
  validationError: string | null;
  onClearError: () => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  compact?: boolean;
  attachedMovieTitle?: string;
}

export const UrlInput: React.FC<UrlInputProps> = ({
  value,
  onChange,
  onSubmit,
  onUploadLocalVideo,
  isValidating,
  validationError,
  onClearError,
  inputRef,
  compact = false,
  attachedMovieTitle,
}) => {
  const [clipboardFeedback, setClipboardFeedback] = useState<string | null>(
    null
  );
  const [useCorsProxy, setUseCorsProxy] = useState<boolean>(false);
  const localVideoInputRef = useRef<HTMLInputElement | null>(null);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValidating) return;
    onSubmit(value, useCorsProxy);
  };

  const handlePasteFromClipboard = async () => {
    setClipboardFeedback(null);
    onClearError();

    if (!navigator.clipboard || !navigator.clipboard.readText) {
      setClipboardFeedback(
        'Clipboard access unavailable. Use Ctrl+V or Cmd+V to paste.'
      );
      inputRef?.current?.focus();
      return;
    }

    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        const cleaned = text.trim();
        onChange(cleaned);
        setClipboardFeedback('URL pasted from clipboard');
        setTimeout(() => setClipboardFeedback(null), 2500);
        inputRef?.current?.focus();
      } else {
        setClipboardFeedback('Clipboard is empty. Copy a video URL first.');
        inputRef?.current?.focus();
      }
    } catch {
      setClipboardFeedback(
        'Browser blocked clipboard read. Press Ctrl+V / Cmd+V in the box.'
      );
      inputRef?.current?.focus();
    }
  };

  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadLocalVideo) return;
    const blobUrl = URL.createObjectURL(file);
    onUploadLocalVideo(blobUrl, file.name);
    e.target.value = '';
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <input
        ref={localVideoInputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.mkv,.mov"
        onChange={handleLocalFileChange}
        className="hidden"
      />

      <form onSubmit={handleFormSubmit} noValidate>
        <div
          className={`relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-2 sm:p-2.5 rounded-2xl bg-[#111218]/95 border transition-all duration-200 shadow-2xl ${
            validationError
              ? 'border-rose-500/70 focus-within:border-rose-500 ring-1 ring-rose-500/30'
              : 'border-white/[0.12] hover:border-white/[0.22] focus-within:border-amber-400/80 focus-within:ring-2 focus-within:ring-amber-400/20'
          }`}
        >
          {/* Left Icon + Input */}
          <div className="relative flex-1 flex items-center min-w-0">
            <Link2
              className={`w-5 h-5 ml-3.5 shrink-0 transition-colors ${
                validationError ? 'text-rose-400' : 'text-amber-400/90'
              }`}
              aria-hidden="true"
            />

            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                if (validationError) onClearError();
              }}
              placeholder={
                attachedMovieTitle
                  ? `Paste YouTube, .m3u8 HLS, or .mp4 URL to stream "${attachedMovieTitle}"…`
                  : 'Paste any YouTube URL, .m3u8 HLS stream, .mp4 movie link, or Vimeo URL…'
              }
              aria-label="Stream URL Input"
              aria-invalid={Boolean(validationError)}
              aria-describedby={
                validationError ? 'url-validation-error' : undefined
              }
              disabled={isValidating}
              className={`w-full pl-3.5 pr-10 ${
                compact ? 'py-2.5 text-sm' : 'py-3.5 text-sm sm:text-base'
              } bg-transparent text-white placeholder-neutral-500 focus:outline-none disabled:opacity-60 truncate`}
            />

            {/* Clear input button */}
            {value && !isValidating && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  onClearError();
                  inputRef?.current?.focus();
                }}
                aria-label="Clear URL input"
                className="p-2 mr-1 text-neutral-400 hover:text-white rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Right Actions: Paste + Upload File + Play Stream */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              disabled={isValidating}
              title="Paste link from clipboard"
              className="px-3.5 py-2.5 sm:py-3 text-xs font-medium text-neutral-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] rounded-xl transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-50"
            >
              <ClipboardPaste className="w-4 h-4 text-neutral-400" />
              <span>Paste URL</span>
            </button>

            {onUploadLocalVideo && (
              <button
                type="button"
                onClick={() => localVideoInputRef.current?.click()}
                disabled={isValidating}
                title="Upload a local video file (.mp4, .webm, .mkv) from your device"
                className="px-3.5 py-2.5 sm:py-3 text-xs font-medium text-neutral-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] rounded-xl transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-50"
              >
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Local File</span>
              </button>
            )}

            <button
              type="submit"
              disabled={isValidating}
              className="flex-1 sm:flex-initial px-6 py-2.5 sm:py-3 text-sm font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 disabled:bg-amber-400/50 disabled:cursor-not-allowed rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/15 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading…</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Stream URL</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Inline Validation Error or Clipboard Feedback */}
        {validationError && (
          <div
            id="url-validation-error"
            role="alert"
            className="mt-3 flex items-start gap-2 text-xs sm:text-sm text-rose-400 px-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{validationError}</span>
          </div>
        )}

        {!validationError && clipboardFeedback && (
          <div
            role="status"
            className="mt-3 flex items-center gap-2 text-xs text-emerald-400 px-2"
          >
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{clipboardFeedback}</span>
          </div>
        )}
      </form>

      {/* Supported Sources + Optional HLS CORS Proxy Toggle */}
      {!compact && (
        <div
          id="supported-sources"
          className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 px-2 text-xs text-neutral-400"
        >
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2.5 gap-y-1">
            <span className="text-neutral-500 font-medium">Supported inputs:</span>
            <span className="text-neutral-300">YouTube Videos &amp; Trailers</span>
            <span aria-hidden="true" className="text-neutral-700">
              ·
            </span>
            <span className="text-neutral-300">HLS Streams (.m3u8)</span>
            <span aria-hidden="true" className="text-neutral-700">
              ·
            </span>
            <span className="text-neutral-300">Direct MP4 / WebM</span>
            <span aria-hidden="true" className="text-neutral-700">
              ·
            </span>
            <span className="text-neutral-300">Vimeo</span>
            <span aria-hidden="true" className="text-neutral-700">
              ·
            </span>
            <span className="text-neutral-300">Local Video &amp; .SRT Files</span>
          </div>

          <button
            type="button"
            onClick={() => setUseCorsProxy((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 text-xs transition-colors ${
              useCorsProxy
                ? 'text-amber-400 font-semibold'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
            title="Enable CORS proxy when playing external .m3u8 HLS streams that block cross-origin browser requests"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>
              HLS Stream Proxy: {useCorsProxy ? 'Enabled' : 'Direct'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
