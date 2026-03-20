import type { DubStatus } from '../hooks/use-dub-job'

interface DubProgressProps {
  status: DubStatus
  progress: number
  step: string
  error: string | null
}

const STEP_LABELS: Record<string, string> = {
  uploading: 'Uploading…',
  queued: 'Queued…',
  'extracting audio': 'Extracting audio…',
  transcribing: 'Transcribing speech…',
  translating: 'Translating to Vietnamese…',
  'synthesizing speech': 'Synthesizing Vietnamese speech…',
  'merging audio & subtitles': 'Merging audio…',
  done: 'Done!',
  error: 'Failed',
}

export function DubProgress({ status, progress, step, error }: DubProgressProps) {
  const label = STEP_LABELS[step] ?? step

  return (
    <div className="w-full max-w-lg space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-300">{label}</span>
        <span className="text-gray-500 tabular-nums">{progress}%</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-800 rounded-full h-1.5">
        <div
          className={[
            'h-1.5 rounded-full transition-all duration-500',
            status === 'error' ? 'bg-red-500' : 'bg-blue-500',
          ].join(' ')}
          style={{ width: `${progress}%` }}
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}
    </div>
  )
}
