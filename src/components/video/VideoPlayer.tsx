import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipForward,
  SkipBack,
} from 'lucide-react';

export interface Chapter {
  title: string;
  startTime: number;
  description?: string;
}

export interface VideoPlayerProps {
  src: string;
  chapters?: Chapter[];
  title?: string;
  autoPlay?: boolean;
  onEnded?: () => void;
  onChapterChange?: (chapter: Chapter) => void;
}

function formatTime(seconds: number): string {
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  chapters = [],
  title,
  autoPlay = false,
  onEnded,
  onChapterChange,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [showControls, setShowControls] = useState(true);
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Determine current chapter from time
  const getChapterAtTime = useCallback(
    (time: number): Chapter | null => {
      if (!chapters.length) return null;
      let current: Chapter | null = null;
      for (const ch of chapters) {
        if (time >= ch.startTime) current = ch;
        else break;
      }
      return current;
    },
    [chapters],
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      const ch = getChapterAtTime(video.currentTime);
      if (ch !== currentChapter) {
        setCurrentChapter(ch);
        if (ch && onChapterChange) onChapterChange(ch);
      }
      // buffered
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };

    const onDurationChange = () => setDuration(video.duration || 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded_ = () => {
      setPlaying(false);
      if (onEnded) onEnded();
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded_);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded_);
    };
  }, [getChapterAtTime, currentChapter, onChapterChange, onEnded]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const video = videoRef.current;
      if (!video) return;
      if (e.code === 'Space') {
        e.preventDefault();
        video.paused ? video.play() : video.pause();
      } else if (e.code === 'ArrowLeft') {
        video.currentTime = Math.max(0, video.currentTime - 5);
      } else if (e.code === 'ArrowRight') {
        video.currentTime = Math.min(video.duration, video.currentTime + 5);
      } else if (e.code === 'KeyF') {
        toggleFullscreen();
      } else if (e.code === 'KeyM') {
        toggleMute();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Fullscreen change listener
  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.paused ? video.play() : video.pause();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressRef.current;
    const video = videoRef.current;
    if (!bar || !video || !duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    video.currentTime = ratio * duration;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (videoRef.current) {
      videoRef.current.volume = v;
      setMuted(v === 0);
    }
  };

  const seekToChapter = (ch: Chapter) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = ch.startTime;
    if (video.paused) video.play();
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPct = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div className="flex flex-col gap-0">
      {/* Video container */}
      <div
        ref={containerRef}
        className="relative bg-black rounded-xl overflow-hidden group"
        style={{ aspectRatio: '16/9' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => playing && setShowControls(false)}
      >
        <video
          ref={videoRef}
          src={src}
          autoPlay={autoPlay}
          className="w-full h-full object-contain"
          onClick={togglePlay}
          playsInline
        />

        {/* Play/pause overlay */}
        {!playing && (
          <div
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            onClick={togglePlay}
          >
            <div className="w-16 h-16 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Play size={28} className="text-white ml-1" />
            </div>
          </div>
        )}

        {/* Chapter label */}
        {currentChapter && (
          <div className="absolute top-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
            {currentChapter.title}
          </div>
        )}

        {/* Controls bar */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-3 pb-3 pt-8 transition-opacity duration-300 ${
            showControls || !playing ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Progress bar */}
          <div
            ref={progressRef}
            className="relative h-1.5 bg-white/30 rounded-full mb-3 cursor-pointer group/progress hover:h-2.5 transition-all"
            onClick={handleProgressClick}
          >
            {/* Buffered */}
            <div
              className="absolute inset-y-0 left-0 bg-white/40 rounded-full"
              style={{ width: `${bufferedPct}%` }}
            />
            {/* Played */}
            <div
              className="absolute inset-y-0 left-0 bg-primary-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
            {/* Chapter markers */}
            {chapters.map((ch) => (
              <div
                key={ch.startTime}
                className="absolute top-1/2 -translate-y-1/2 w-1 h-2.5 bg-yellow-400 rounded-sm cursor-pointer z-10"
                style={{ left: `${duration > 0 ? (ch.startTime / duration) * 100 : 0}%` }}
                title={ch.title}
                onClick={(e) => {
                  e.stopPropagation();
                  seekToChapter(ch);
                }}
              />
            ))}
            {/* Thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover/progress:opacity-100 transition-opacity"
              style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
            />
          </div>

          {/* Controls row */}
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="text-white hover:text-primary-300 transition-colors">
              {playing ? <Pause size={18} /> : <Play size={18} />}
            </button>

            <button
              onClick={() => {
                const v = videoRef.current;
                if (v) v.currentTime = Math.max(0, v.currentTime - 10);
              }}
              className="text-white hover:text-primary-300 transition-colors"
              title="Back 10s"
            >
              <SkipBack size={16} />
            </button>

            <button
              onClick={() => {
                const v = videoRef.current;
                if (v) v.currentTime = Math.min(v.duration, v.currentTime + 10);
              }}
              className="text-white hover:text-primary-300 transition-colors"
              title="Forward 10s"
            >
              <SkipForward size={16} />
            </button>

            {/* Time */}
            <span className="text-white text-xs font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <div className="flex-1" />

            {/* Volume */}
            <div className="flex items-center gap-1.5">
              <button onClick={toggleMute} className="text-white hover:text-primary-300 transition-colors">
                {muted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={muted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 accent-primary-500"
              />
            </div>

            {/* Fullscreen */}
            <button onClick={toggleFullscreen} className="text-white hover:text-primary-300 transition-colors">
              {fullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Chapter list below video */}
      {chapters.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Chapters</h4>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {chapters.map((ch, i) => (
              <button
                key={ch.startTime}
                onClick={() => seekToChapter(ch)}
                className={`text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                  currentChapter?.startTime === ch.startTime
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 font-semibold'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700/50 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-gray-400 dark:text-gray-500 mr-1">{i + 1}.</span>
                {ch.title}
                <div className="text-gray-400 dark:text-gray-500 mt-0.5 font-mono">
                  {formatTime(ch.startTime)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
