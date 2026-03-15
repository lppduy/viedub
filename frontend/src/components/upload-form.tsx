import { useRef, useState, useCallback } from 'react'

const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska']
const ACCEPTED_EXTENSIONS = '.mp4,.webm,.mov,.avi,.mkv'

interface UploadFormProps {
  onFileSelect: (file: File) => void
}

function isValidVideoFile(file: File): boolean {
  return ACCEPTED_VIDEO_TYPES.includes(file.type) || /\.(mp4|webm|mov|avi|mkv)$/i.test(file.name)
}

export function UploadForm({ onFileSelect }: UploadFormProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback((file: File) => {
    if (!isValidVideoFile(file)) {
      setError('Unsupported file type. Please upload MP4, WebM, MOV, AVI, or MKV.')
      return
    }
    setError(null)
    onFileSelect(file)
  }, [onFileSelect])

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">VieDub</h1>
          <p className="text-gray-400">AI-powered Vietnamese dubbing & subtitles</p>
        </div>

        <div
          role="button"
          tabIndex={0}
          aria-label="Drop video file here or click to browse"
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          className={[
            'cursor-pointer rounded-2xl border-2 border-dashed p-16',
            'flex flex-col items-center justify-center gap-4',
            'transition-colors duration-200',
            isDragging
              ? 'border-blue-400 bg-blue-950/30'
              : 'border-gray-700 bg-gray-900 hover:border-gray-500 hover:bg-gray-800',
          ].join(' ')}
        >
          {/* Upload icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-14 w-14 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>

          <div className="text-center space-y-1">
            <p className="text-white font-medium">
              {isDragging ? 'Drop your video here' : 'Drag & drop a video file'}
            </p>
            <p className="text-gray-500 text-sm">or click to browse</p>
            <p className="text-gray-600 text-xs mt-2">MP4, WebM, MOV, AVI, MKV</p>
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          onChange={onInputChange}
          className="hidden"
        />

        <p className="text-center text-gray-600 text-xs">
          Videos are processed locally — nothing is uploaded to any server.
        </p>
      </div>
    </div>
  )
}
