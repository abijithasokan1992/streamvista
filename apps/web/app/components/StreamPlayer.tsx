import React, { useEffect, useMemo, useRef, useState } from 'react';

type StreamPlayerProps = {
  src?: string | null;
  poster?: string | null;
  title?: string;
  autoPlay?: boolean;
  muted?: boolean;
  controls?: boolean;
  className?: string;
};

function isHls(src: string) { return /\.m3u8(?:$|\?)/i.test(src); }

export default function StreamPlayer({ src, poster, title = 'StreamVista player', autoPlay = false, muted = false, controls = true, className = '' }: StreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState('');
  const [nativeHls, setNativeHls] = useState(false);

  const resolvedSrc = useMemo(() => (src || '').trim(), [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !resolvedSrc) return;
    setError('');
    const supportsNativeHls = video.canPlayType('application/vnd.apple.mpegurl') !== '';
    setNativeHls(supportsNativeHls);

    if (isHls(resolvedSrc) && !supportsNativeHls) {
      setError('This browser needs an HLS-compatible playback layer for this stream.');
      return;
    }

    video.src = resolvedSrc;
    video.load();
    if (autoPlay) void video.play().catch(() => undefined);

    return () => {
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, [resolvedSrc, autoPlay]);

  if (!resolvedSrc) {
    return <div className={`grid aspect-video place-items-center rounded-2xl border border-white/10 bg-black/40 text-sm text-white/35 ${className}`}>No stream attached</div>;
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-black ${className}`}>
      <video
        ref={videoRef}
        className="aspect-video w-full bg-black object-contain"
        poster={poster || undefined}
        controls={controls}
        playsInline
        autoPlay={autoPlay}
        muted={muted}
        preload="metadata"
        aria-label={title}
        onError={() => setError('Playback failed. Check the stream URL, access rights and delivery status.')}
      />
      {error && <div className="absolute inset-x-0 bottom-0 border-t border-red-400/20 bg-black/80 px-4 py-3 text-xs text-red-200">{error}</div>}
      {isHls(resolvedSrc) && nativeHls && <div className="pointer-events-none absolute left-3 top-3 rounded-full border border-white/10 bg-black/65 px-2.5 py-1 text-[10px] font-semibold tracking-[0.16em] text-white/65">HLS</div>}
    </div>
  );
}
