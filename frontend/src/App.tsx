import { useState, useEffect, useRef } from 'react'
import { UploadForm } from './components/upload-form'
import { VideoPlayer } from './components/video-player'

function App() {
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const blobUrlRef = useRef<string | null>(null)

  // Revoke previous blob URL to free memory
  const handleFileSelect = (file: File) => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
    }
    const url = URL.createObjectURL(file)
    blobUrlRef.current = url
    setFileName(file.name)
    setVideoSrc(url)
  }

  const handleUploadAnother = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }
    setVideoSrc(null)
    setFileName('')
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

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 gap-4">
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

        <VideoPlayer src={videoSrc} />

        <p className="text-center text-gray-700 text-xs">
          Space = play/pause · ← → = seek 5s · ↑ ↓ = volume · M = mute · F = fullscreen
        </p>
      </div>
    </div>
  )
}

export default App
