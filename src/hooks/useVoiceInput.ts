import { useCallback, useEffect, useRef, useState } from 'react'

type SpeechRecognitionLike = {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: { error?: string }) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

type SpeechRecognitionEventLike = {
  resultIndex: number
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal?: boolean }>
}

/** Pause after user stops talking before sending (ms). */
const SILENCE_COMMIT_MS = 850
/** Delay before mic re-opens after agent speaks — avoids echo pickup. */
const MIC_RESUME_DELAY_MS = 280
const RESTART_MS = 60

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionLike
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

function extractInterim(event: SpeechRecognitionEventLike) {
  let text = ''
  for (let i = event.resultIndex; i < event.results.length; i++) {
    const chunk = event.results[i]
    if (!chunk.isFinal) text += chunk[0]?.transcript ?? ''
  }
  return text.trim()
}

function extractNewFinal(event: SpeechRecognitionEventLike) {
  let text = ''
  for (let i = event.resultIndex; i < event.results.length; i++) {
    const chunk = event.results[i]
    if (chunk.isFinal) text += chunk[0]?.transcript ?? ''
  }
  return text.trim()
}

export type VoiceInputStatus =
  | 'idle'
  | 'requesting'
  | 'listening'
  | 'paused'
  | 'unsupported'
  | 'denied'

export interface UseVoiceInputOptions {
  onFinalText: (text: string) => void
  /** Temporarily pause mic (agent speaking / thinking) without turning off voice mode */
  disabled?: boolean
  lang?: string
}

export function useVoiceInput({
  onFinalText,
  disabled = false,
  lang = 'en-US',
}: UseVoiceInputOptions) {
  const [status, setStatus] = useState<VoiceInputStatus>('idle')
  const [interimText, setInterimText] = useState('')
  const [voiceMode, setVoiceMode] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const wantActiveRef = useRef(false)
  const recogRef = useRef<SpeechRecognitionLike | null>(null)
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onFinalTextRef = useRef(onFinalText)
  const disabledRef = useRef(disabled)
  const processingSpeechRef = useRef(false)
  const interimBufferRef = useRef('')
  const resumeGenerationRef = useRef(0)

  onFinalTextRef.current = onFinalText
  disabledRef.current = disabled

  const clearRestartTimer = useCallback(() => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current)
      restartTimerRef.current = null
    }
  }, [])

  const clearResumeTimer = useCallback(() => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current)
      resumeTimerRef.current = null
    }
  }, [])

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
  }, [])

  const teardownRecognition = useCallback(
    (hard = false) => {
      clearRestartTimer()
      clearSilenceTimer()
      const recog = recogRef.current
      recogRef.current = null
      if (!recog) return
      try {
        if (hard) recog.abort()
        else recog.stop()
      } catch {
        // ignore
      }
    },
    [clearRestartTimer, clearSilenceTimer],
  )

  const commitTextRef = useRef<(text: string) => void>(() => undefined)
  const scheduleSilenceCommitRef = useRef<() => void>(() => undefined)
  const beginRecognitionRef = useRef<() => void>(() => undefined)

  const commitText = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || processingSpeechRef.current || disabledRef.current) return
      if (trimmed.length < 2) return

      processingSpeechRef.current = true
      interimBufferRef.current = ''
      setInterimText('')
      clearSilenceTimer()
      teardownRecognition(false)
      setStatus('paused')
      onFinalTextRef.current(trimmed)
    },
    [clearSilenceTimer, teardownRecognition],
  )

  const scheduleSilenceCommit = useCallback(() => {
    clearSilenceTimer()
    silenceTimerRef.current = setTimeout(() => {
      const pending = interimBufferRef.current.trim()
      if (
        pending.length >= 2 &&
        wantActiveRef.current &&
        !disabledRef.current &&
        !processingSpeechRef.current
      ) {
        commitTextRef.current(pending)
      }
    }, SILENCE_COMMIT_MS)
  }, [clearSilenceTimer])

  commitTextRef.current = commitText
  scheduleSilenceCommitRef.current = scheduleSilenceCommit

  const beginRecognition = useCallback(() => {
    if (disabledRef.current || !wantActiveRef.current || processingSpeechRef.current) {
      if (wantActiveRef.current && disabledRef.current) setStatus('paused')
      return
    }

    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) {
      setStatus('unsupported')
      setError('Voice input needs Chrome or Edge on desktop.')
      wantActiveRef.current = false
      setVoiceMode(false)
      return
    }

    if (recogRef.current) return

    const recog = new Ctor()
    recogRef.current = recog
    recog.continuous = true
    recog.interimResults = true
    recog.lang = lang
    recog.maxAlternatives = 1

    recog.onstart = () => {
      setStatus('listening')
      setError(null)
    }

    recog.onresult = (event) => {
      if (disabledRef.current || processingSpeechRef.current) return

      const finalText = extractNewFinal(event)
      if (finalText) {
        commitTextRef.current(finalText)
        return
      }

      const spoken = extractInterim(event)
      if (spoken) {
        interimBufferRef.current = spoken
        setInterimText(spoken)
        scheduleSilenceCommitRef.current()
      }
    }

    recog.onerror = (event) => {
      if (event.error === 'aborted') return

      if (event.error === 'no-speech') {
        if (wantActiveRef.current && !disabledRef.current && !processingSpeechRef.current) {
          clearRestartTimer()
          restartTimerRef.current = setTimeout(() => beginRecognitionRef.current(), RESTART_MS)
        }
        return
      }

      if (event.error === 'not-allowed') {
        setStatus('denied')
        setError('Microphone blocked. Allow access in browser settings.')
        wantActiveRef.current = false
        setVoiceMode(false)
        return
      }

      if (event.error === 'network') {
        setError('Speech recognition needs internet (browser API).')
      }

      recogRef.current = null
      if (wantActiveRef.current && !disabledRef.current && !processingSpeechRef.current) {
        clearRestartTimer()
        restartTimerRef.current = setTimeout(() => beginRecognitionRef.current(), RESTART_MS)
      } else if (wantActiveRef.current) {
        setStatus('paused')
      } else {
        setStatus('idle')
      }
    }

    recog.onend = () => {
      if (recogRef.current !== recog) return
      recogRef.current = null
      if (processingSpeechRef.current) return
      if (wantActiveRef.current && !disabledRef.current) {
        clearRestartTimer()
        restartTimerRef.current = setTimeout(() => beginRecognitionRef.current(), RESTART_MS)
      } else if (wantActiveRef.current) {
        setStatus('paused')
      } else {
        setStatus('idle')
      }
    }

    try {
      recog.start()
    } catch {
      recogRef.current = null
      clearRestartTimer()
      restartTimerRef.current = setTimeout(() => beginRecognitionRef.current(), RESTART_MS + 60)
    }
  }, [clearRestartTimer, lang])

  beginRecognitionRef.current = beginRecognition

  const scheduleResume = useCallback(
    (delayMs = MIC_RESUME_DELAY_MS) => {
      clearResumeTimer()
      const generation = ++resumeGenerationRef.current
      resumeTimerRef.current = setTimeout(() => {
        if (generation !== resumeGenerationRef.current) return
        processingSpeechRef.current = false
        interimBufferRef.current = ''
        setInterimText('')
        if (!wantActiveRef.current || disabledRef.current) {
          if (wantActiveRef.current) setStatus('paused')
          return
        }
        beginRecognition()
      }, delayMs)
    },
    [beginRecognition, clearResumeTimer],
  )

  const start = useCallback(async () => {
    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) {
      setStatus('unsupported')
      setError('Voice input needs Chrome or Edge on desktop.')
      return
    }

    setStatus('requesting')
    setError(null)
    wantActiveRef.current = true
    setVoiceMode(true)
    resumeGenerationRef.current += 1
    clearResumeTimer()

    if (navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach((t) => t.stop())
      } catch {
        setStatus('denied')
        setError('Allow microphone access in the browser prompt.')
        wantActiveRef.current = false
        setVoiceMode(false)
        return
      }
    }

    if (!disabledRef.current) {
      processingSpeechRef.current = false
      beginRecognition()
    } else {
      setStatus('paused')
    }
  }, [beginRecognition, clearResumeTimer])

  const stop = useCallback(() => {
    wantActiveRef.current = false
    processingSpeechRef.current = false
    resumeGenerationRef.current += 1
    interimBufferRef.current = ''
    setVoiceMode(false)
    setInterimText('')
    setStatus('idle')
    clearResumeTimer()
    teardownRecognition(true)
  }, [clearResumeTimer, teardownRecognition])

  const pause = useCallback(() => {
    resumeGenerationRef.current += 1
    clearResumeTimer()
    interimBufferRef.current = ''
    setInterimText('')
    teardownRecognition(false)
    if (wantActiveRef.current) setStatus('paused')
  }, [clearResumeTimer, teardownRecognition])

  const clearProcessing = useCallback(() => {
    processingSpeechRef.current = false
  }, [])

  // Pause while agent speaks/thinks; debounced resume when clear (anti-echo).
  useEffect(() => {
    if (disabled) {
      pause()
    } else if (wantActiveRef.current) {
      scheduleResume()
    }
  }, [disabled, pause, scheduleResume])

  useEffect(() => {
    return () => {
      wantActiveRef.current = false
      resumeGenerationRef.current += 1
      clearRestartTimer()
      clearResumeTimer()
      clearSilenceTimer()
      teardownRecognition(true)
    }
  }, [clearRestartTimer, clearResumeTimer, clearSilenceTimer, teardownRecognition])

  const isListening = status === 'listening' || status === 'requesting'
  const isVoiceActive = voiceMode

  return {
    isListening,
    isVoiceActive,
    status,
    voiceMode,
    interimText,
    error,
    start,
    stop,
    pause,
    scheduleResume,
    clearProcessing,
  }
}

export function stopSpeaking() {
  window.speechSynthesis?.cancel()
}
