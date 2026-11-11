import { useEffect, useRef, useState } from 'react'

export interface ScanFeedback {
  ok: boolean
  message: string
}

interface ScanInputProps {
  label: string
  /** Validates the scan (usually against the API). Rejections are shown via `feedback`. */
  onScan: (code: string) => Promise<unknown>
  feedback: ScanFeedback | null
  busy?: boolean
  placeholder?: string
}

type Detector = { detect: (source: CanvasImageSource) => Promise<{ rawValue: string }[]> }
type DetectorCtor = new (opts: { formats: string[] }) => Detector
const BarcodeDetectorImpl = (globalThis as { BarcodeDetector?: DetectorCtor }).BarcodeDetector

/** Short tone so operators know the result without looking at the screen. */
function beep(ok: boolean) {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    osc.frequency.value = ok ? 880 : 220
    osc.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + (ok ? 0.08 : 0.25))
  } catch {
    // Audio unavailable: visual feedback still shows.
  }
}

/**
 * Barcode input for keyboard-wedge scanners: they type the code and press Enter.
 * Stays focused, ignores new scans while one is being validated (no duplicate
 * submissions), and offers the camera as a fallback where the browser supports it.
 */
export function ScanInput({ label, onScan, feedback, busy = false, placeholder = 'Scan or type, then Enter' }: ScanInputProps) {
  const input = useRef<HTMLInputElement>(null)
  const [code, setCode] = useState('')
  const [camera, setCamera] = useState(false)
  const inFlight = useRef(false)

  useEffect(() => {
    if (!busy) input.current?.focus()
  }, [busy, feedback])

  useEffect(() => {
    if (feedback) beep(feedback.ok)
  }, [feedback])

  const submit = async (value: string) => {
    const trimmed = value.trim()
    if (!trimmed || inFlight.current) return
    inFlight.current = true
    setCode('')
    try {
      await onScan(trimmed)
    } finally {
      inFlight.current = false
    }
  }

  return (
    <div>
      <label htmlFor="scan-input" className="form-label fw-semibold">{label}</label>
      <div className="input-group input-group-lg">
        <span className="input-group-text"><i className="ri-barcode-line" /></span>
        <input
          id="scan-input"
          ref={input}
          className="form-control font-monospace"
          autoComplete="off"
          autoCapitalize="characters"
          inputMode="text"
          placeholder={placeholder}
          value={code}
          disabled={busy}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              void submit(code)
            }
          }}
        />
        {BarcodeDetectorImpl && (
          <button type="button" className="btn btn-light" aria-label="Scan with camera" onClick={() => setCamera((c) => !c)}>
            <i className="ri-camera-line" />
          </button>
        )}
      </div>
      {camera && <CameraScanner onDetect={(value) => { setCamera(false); void submit(value) }} />}
      <div role="status" aria-live="assertive" className={`scan-feedback mt-3 ${feedback ? (feedback.ok ? 'ok' : 'error') : ''}`}>
        {feedback && (
          <>
            <i className={feedback.ok ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill'} /> {feedback.message}
          </>
        )}
      </div>
    </div>
  )
}

function CameraScanner({ onDetect }: { onDetect: (value: string) => void }) {
  const video = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  const detected = useRef(onDetect)
  detected.current = onDetect

  useEffect(() => {
    let stream: MediaStream | null = null
    let timer: number | undefined
    let stopped = false
    const detector = new BarcodeDetectorImpl!({ formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'qr_code', 'upc_a'] })
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((s) => {
        stream = s
        if (!video.current || stopped) return
        video.current.srcObject = s
        void video.current.play()
        const tick = async () => {
          if (stopped || !video.current) return
          const found = await detector.detect(video.current).catch(() => [])
          if (found[0]) detected.current(found[0].rawValue)
          else timer = window.setTimeout(tick, 250)
        }
        void tick()
      })
      .catch(() => setError('Camera unavailable. Allow camera access or use a scanner.'))
    return () => {
      stopped = true
      window.clearTimeout(timer)
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  return error ? <div className="alert alert-warning mt-3 mb-0">{error}</div> : <video ref={video} className="w-100 rounded mt-3 bg-dark" style={{ maxHeight: 260, objectFit: 'cover' }} muted playsInline />
}
