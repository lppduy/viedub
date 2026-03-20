import { useRef, useEffect, useCallback, useState } from 'react'
import { useVideoPlayer, PLAYBACK_SPEEDS } from '../hooks/use-video-player'

interface VideoPlayerProps {
  src: string
  subtitlesSrc?: string   // WebVTT URL for Vietnamese subtitles
  dubbedAudioSrc?: string // Dubbed WAV URL; when active, video is muted
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// Icon components to avoid external deps
function IconPlay() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}
function IconPause() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  )
}
function IconVolume({ muted }: { muted: boolean }) {
  return muted ? (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
    </svg>
  )
}
function IconFullscreen() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
    </svg>
  )
}

export function VideoPlayer({ src, subtitlesSrc, dubbedAudioSrc }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const dubbedAudioRef = useRef<HTMLAudioElement | null>(null)
  const [isDubbed, setIsDubbed] = useState(false)
  const {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    progress,
    volume,
    isMuted,
    playbackSpeed,
    isLoading,
    togglePlay,
    seek,
    seekBySeconds,
    setVolume,
    toggleMute,
    setPlaybackSpeed,
    toggleFullscreen,
  } = useVideoPlayer()

  const handleSeekBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pct = parseFloat(e.target.value)
    seek((pct / 100) * duration)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value))
  }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName
    if (tag === 'INPUT' || tag === 'SELECT') return

    switch (e.key) {
      case ' ':
        e.preventDefault()
        togglePlay()
        break
      case 'ArrowLeft':
        e.preventDefault()
        seekBySeconds(-5)
        break
      case 'ArrowRight':
        e.preventDefault()
        seekBySeconds(5)
        break
      case 'ArrowUp':
        e.preventDefault()
        setVolume(volume + 0.1)
        break
      case 'ArrowDown':
        e.preventDefault()
        setVolume(volume - 0.1)
        break
      case 'm':
      case 'M':
        toggleMute()
        break
      case 'f':
      case 'F':
        toggleFullscreen(containerRef)
        break
    }
  }, [togglePlay, seekBySeconds, setVolume, toggleMute, toggleFullscreen, volume])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Keep dubbed <audio> in sync with video play/pause/seek
  useEffect(() => {
    const video = videoRef.current
    const audio = dubbedAudioRef.current
    if (!isDubbed || !audio || !video) return

    audio.currentTime = video.currentTime
    if (isPlaying) audio.play().catch(() => {})
    else audio.pause()
  }, [isDubbed, isPlaying, videoRef])

  // Sync dubbed audio position when user seeks
  useEffect(() => {
    const video = videoRef.current
    const audio = dubbedAudioRef.current
    if (!isDubbed || !audio || !video) return
    const onSeeked = () => { audio.currentTime = video.currentTime }
    video.addEventListener('seeked', onSeeked)
    return () => video.removeEventListener('seeked', onSeeked)
  }, [isDubbed, videoRef])

  return (
    <div
      ref={containerRef}
      className="relative bg-black w-full max-w-4xl mx-auto rounded-xl overflow-hidden group"
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src={src}
        muted={isDubbed}
        className="w-full aspect-video cursor-pointer"
        onClick={togglePlay}
      >
        {subtitlesSrc && (
          <track kind="subtitles" src={subtitlesSrc} srcLang="vi" label="Tiếng Việt" default />
        )}
      </video>

      {/* Dubbed audio — hidden, kept in sync with video */}
      {dubbedAudioSrc && (
        <audio ref={dubbedAudioRef} src={dubbedAudioSrc} preload="auto" />
      )}

      {/* Loading spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
          <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Controls bar — visible on hover or when paused */}
      <div className={[
        'absolute bottom-0 left-0 right-0 px-4 pt-8 pb-3',
        'bg-gradient-to-t from-black/80 to-transparent',
        'transition-opacity duration-300',
        isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100',
      ].join(' ')}>

        {/* Seek bar */}
        <input
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={progress}
          onChange={handleSeekBarChange}
          className="w-full h-1 accent-blue-500 cursor-pointer mb-3"
          aria-label="Seek"
        />

        <div className="flex items-center gap-3">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="text-white hover:text-blue-400 transition-colors"
          >
            {isPlaying ? <IconPause /> : <IconPlay />}
          </button>

          {/* Time */}
          <span className="text-white text-xs tabular-nums">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Volume */}
          <button onClick={toggleMute} aria-label="Toggle mute" className="text-white hover:text-blue-400 transition-colors">
            <IconVolume muted={isMuted} />
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 h-1 accent-blue-500 cursor-pointer"
            aria-label="Volume"
          />

          {/* Playback speed */}
          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
            className="bg-gray-800 text-white text-xs rounded px-1 py-0.5 border border-gray-600 cursor-pointer"
            aria-label="Playback speed"
          >
            {PLAYBACK_SPEEDS.map((s) => (
              <option key={s} value={s}>{s}x</option>
            ))}
          </select>

          {/* Dubbed audio toggle — only shown when dubbed audio is available */}
          {dubbedAudioSrc && (
            <button
              onClick={() => setIsDubbed(d => !d)}
              aria-label="Toggle dubbed audio"
              title={isDubbed ? 'Switch to original audio' : 'Switch to Vietnamese dub'}
              className={[
                'text-xs px-2 py-0.5 rounded border transition-colors',
                isDubbed
                  ? 'border-blue-400 text-blue-400'
                  : 'border-gray-600 text-gray-400 hover:border-gray-400',
              ].join(' ')}
            >
              {isDubbed ? 'VI' : 'EN'}
            </button>
          )}

          {/* Fullscreen */}
          <button
            onClick={() => toggleFullscreen(containerRef)}
            aria-label="Toggle fullscreen"
            className="text-white hover:text-blue-400 transition-colors"
          >
            <IconFullscreen />
          </button>
        </div>
      </div>
    </div>
  )
}
