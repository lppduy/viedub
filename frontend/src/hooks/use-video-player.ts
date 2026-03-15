import { useRef, useState, useCallback, useEffect } from 'react'

export interface VideoPlayerState {
  isPlaying: boolean
  currentTime: number
  duration: number
  progress: number
  volume: number
  isMuted: boolean
  playbackSpeed: number
  isFullscreen: boolean
  isLoading: boolean
}

export interface VideoPlayerControls {
  videoRef: React.RefObject<HTMLVideoElement | null>
  togglePlay: () => void
  seek: (time: number) => void
  seekBySeconds: (seconds: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  setPlaybackSpeed: (speed: number) => void
  toggleFullscreen: (containerRef: React.RefObject<HTMLDivElement | null>) => void
}

export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]

export function useVideoPlayer(): VideoPlayerState & VideoPlayerControls {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackSpeed, setPlaybackSpeedState] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onTimeUpdate = () => setCurrentTime(video.currentTime)
    const onDurationChange = () => setDuration(video.duration || 0)
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onWaiting = () => setIsLoading(true)
    const onCanPlay = () => setIsLoading(false)
    const onEnded = () => setIsPlaying(false)

    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('durationchange', onDurationChange)
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('waiting', onWaiting)
    video.addEventListener('canplay', onCanPlay)
    video.addEventListener('ended', onEnded)

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('durationchange', onDurationChange)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('waiting', onWaiting)
      video.removeEventListener('canplay', onCanPlay)
      video.removeEventListener('ended', onEnded)
    }
  }, [])

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }, [])

  const seek = useCallback((time: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.max(0, Math.min(time, video.duration || 0))
  }, [])

  const seekBySeconds = useCallback((seconds: number) => {
    const video = videoRef.current
    if (!video) return
    seek(video.currentTime + seconds)
  }, [seek])

  const setVolume = useCallback((newVolume: number) => {
    const video = videoRef.current
    if (!video) return
    const clamped = Math.max(0, Math.min(1, newVolume))
    video.volume = clamped
    setVolumeState(clamped)
    if (clamped > 0 && video.muted) {
      video.muted = false
      setIsMuted(false)
    }
  }, [])

  const toggleMute = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setIsMuted(video.muted)
  }, [])

  const setPlaybackSpeed = useCallback((speed: number) => {
    const video = videoRef.current
    if (!video) return
    video.playbackRate = speed
    setPlaybackSpeedState(speed)
  }, [])

  const toggleFullscreen = useCallback((containerRef: React.RefObject<HTMLDivElement | null>) => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }, [])

  return {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    progress,
    volume,
    isMuted,
    playbackSpeed,
    isFullscreen,
    isLoading,
    togglePlay,
    seek,
    seekBySeconds,
    setVolume,
    toggleMute,
    setPlaybackSpeed,
    toggleFullscreen,
  }
}
