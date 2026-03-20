/**
 * Handles the full dub pipeline:
 * 1. Upload video to POST /api/dub → job_id
 * 2. Poll GET /api/jobs/{id} every 2s until done/error
 * 3. Return output URLs when done
 */
import { useState, useRef, useCallback } from 'react'

const API = 'http://localhost:8000'
const POLL_INTERVAL_MS = 2000

export type DubStatus = 'idle' | 'uploading' | 'processing' | 'done' | 'error'

export interface DubResult {
  audioUrl: string      // GET /api/output/{id}/audio
  subtitlesUrl: string  // GET /api/output/{id}/subtitles
}

export interface DubState {
  status: DubStatus
  progress: number      // 0-100
  step: string
  result: DubResult | null
  error: string | null
}

export function useDubJob() {
  const [state, setState] = useState<DubState>({
    status: 'idle',
    progress: 0,
    step: '',
    result: null,
    error: null,
  })

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  const startDub = useCallback(async (file: File) => {
    setState({ status: 'uploading', progress: 0, step: 'uploading', result: null, error: null })

    let jobId: string
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(`${API}/api/dub`, { method: 'POST', body: form })
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
      const data = await res.json()
      jobId = data.job_id
    } catch (err) {
      setState(s => ({ ...s, status: 'error', error: String(err) }))
      return
    }

    setState(s => ({ ...s, status: 'processing', step: 'queued' }))

    // Poll for job status
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API}/api/jobs/${jobId}`)
        // 404 = job lost (server restarted) — stop polling and surface error
        if (res.status === 404) {
          stopPolling()
          setState(s => ({ ...s, status: 'error', error: 'Job not found — server may have restarted. Please re-upload.' }))
          return
        }
        if (!res.ok) throw new Error(`Poll failed: ${res.status}`)
        const job = await res.json()

        if (job.status === 'done') {
          stopPolling()
          setState({
            status: 'done',
            progress: 100,
            step: 'done',
            error: null,
            result: {
              audioUrl: `${API}/api/output/${jobId}/audio`,
              subtitlesUrl: `${API}/api/output/${jobId}/subtitles`,
            },
          })
        } else if (job.status === 'error') {
          stopPolling()
          setState(s => ({ ...s, status: 'error', error: job.error ?? 'Unknown error' }))
        } else {
          setState(s => ({ ...s, progress: job.progress, step: job.step }))
        }
      } catch {
        // Network blip — keep polling
      }
    }, POLL_INTERVAL_MS)
  }, [])

  const reset = useCallback(() => {
    stopPolling()
    setState({ status: 'idle', progress: 0, step: '', result: null, error: null })
  }, [])

  return { ...state, startDub, reset }
}
