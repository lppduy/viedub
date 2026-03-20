import { useState, useEffect, useRef, useCallback } from 'react'
import { UploadForm } from './components/upload-form'
import { VideoPlayer } from './components/video-player'
import { DubProgress } from './components/dub-progress'
import { useDubJob } from './hooks/use-dub-job'

function App() {
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const blobUrlRef = useRef<string | null>(null)
  const dub = useDubJob()

  // Revoke previous blob URL to free memory
  const handleFileSelect = (file: File) => {
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
    const url = URL.createObjectURL(file)
    blobUrlRef.current = url
    setFileName(file.name)
    setVideoSrc(url)
    dub.startDub(file)   // kick off backend pipeline immediately
  }

  const handleUploadAnother = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }
    setVideoSrc(null)
    setFileName('')
    dub.reset()
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
    }
  }, [])

  if (!videoSrc) {
    return <UploadForm onFileSelect={handleFileSelect} />
  }

  const isProcessing = dub.status === 'uploading' || dub.status === 'processing'

  // Allow drag-and-drop onto the player page to load a new video
  const handleDragOver = useCallback((e: React.DragEvent) => e.preventDefault(), [])
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }, [])

  return (
    <div
      className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 gap-4"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="w-full max-w-4xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-semibold text-lg">VieDub</h1>
            {fileName && (
              <p className="text-gray-500 text-sm truncate max-w-xs">{fileName}</p>
            )}
          </div>
          <button
            onClick={handleUploadAnother}
            className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-lg px-3 py-1.5 transition-colors"
          >
            Upload another
          </button>
        </div>

        <VideoPlayer
          src={videoSrc}
          subtitlesSrc={dub.result?.subtitlesUrl}
          dubbedAudioSrc={dub.result?.audioUrl}
        />

        {/* Show progress bar while pipeline is running */}
        {isProcessing && (
          <div className="flex justify-center">
            <DubProgress
              status={dub.status}
              progress={dub.progress}
              step={dub.step}
              error={dub.error}
            />
          </div>
        )}

        {/* Show error if pipeline failed */}
        {dub.status === 'error' && (
          <p className="text-center text-red-400 text-sm">{dub.error}</p>
        )}

        <p className="text-center text-gray-700 text-xs">
          Space = play/pause · ← → = seek 5s · ↑ ↓ = volume · M = mute · F = fullscreen
        </p>
      </div>
    </div>
  )
}

export default App
