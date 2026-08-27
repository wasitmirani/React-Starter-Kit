/**
 * Natural agent speech — backend TTS (Sarah / Zira) with browser fallback.
 */

import { shouldMockModule } from '@/config/env.config'
import { API_BASE_URL } from '@/config/env.config'
import { storageService } from '@/services/storage.service'

export const VOICE_PRESETS = [
  { id: 'sarah', label: 'Sarah — warm female (recommended)', provider: 'Natural TTS' },
  { id: 'zira', label: 'Zira — US English female', provider: 'Windows SAPI' },
  { id: 'hazel', label: 'Hazel — UK English female', provider: 'Windows SAPI' },
  { id: 'amy', label: 'Amy — Piper female', provider: 'Piper' },
  { id: 'lessac', label: 'Lessac — neutral US', provider: 'Piper' },
] as const

let currentAudio: HTMLAudioElement | null = null
let voicesReady = false

const FEMALE_VOICE_PATTERNS = [
  /zira/i,
  /samantha/i,
  /sarah/i,
  /jenny/i,
  /aria/i,
  /hazel/i,
  /google.*english.*female/i,
  /microsoft.*zira/i,
  /female/i,
  /woman/i,
]

function waitForVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis
    const existing = synth.getVoices()
    if (existing.length > 0) {
      voicesReady = true
      resolve(existing)
      return
    }
    const onVoices = () => {
      voicesReady = true
      synth.removeEventListener('voiceschanged', onVoices)
      resolve(synth.getVoices())
    }
    synth.addEventListener('voiceschanged', onVoices)
    setTimeout(() => resolve(synth.getVoices()), 400)
  })
}

export function pickFemaleBrowserVoice(
  voices: SpeechSynthesisVoice[],
  lang = 'en-US',
): SpeechSynthesisVoice | null {
  const enVoices = voices.filter((v) => v.lang.startsWith(lang.slice(0, 2)))
  for (const pattern of FEMALE_VOICE_PATTERNS) {
    const match = enVoices.find((v) => pattern.test(v.name))
    if (match) return match
  }
  return enVoices[0] ?? voices[0] ?? null
}

/** Clean text for natural speech. */
export function humanizeForSpeech(text: string): string {
  return text
    .replace(/\*\*|__|`|#{1,6}\s/g, '')
    .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, '')
    .replace(/\s*[-–—]\s*/g, ', ')
    .replace(/\n+/g, '. ')
    .replace(/\s{2,}/g, ' ')
    .replace(/([.!?])\s*([A-Z])/g, '$1 $2')
    .trim()
}

function trimToMaxLen(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  const slice = text.slice(0, maxLen)
  const lastSpace = slice.lastIndexOf(' ')
  return lastSpace > 20 ? slice.slice(0, lastSpace) : slice
}

export function splitSpeechChunks(text: string, maxLen = 180): string[] {
  const cleaned = humanizeForSpeech(text)
  if (!cleaned) return []

  const sentences = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [cleaned]
  const chunks: string[] = []
  let buf = ''

  for (const sentence of sentences) {
    const part = sentence.trim()
    if (!part) continue
    if ((buf + ' ' + part).trim().length <= maxLen) {
      buf = (buf + ' ' + part).trim()
    } else {
      if (buf) chunks.push(buf)
      buf = part.length <= maxLen ? part : trimToMaxLen(part, maxLen)
    }
  }
  if (buf) chunks.push(buf)
  return chunks.length ? chunks : [cleaned.slice(0, maxLen)]
}

export function stopAgentSpeech() {
  window.speechSynthesis?.cancel()
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.src = ''
    currentAudio = null
  }
}

async function playWavBuffer(buffer: ArrayBuffer): Promise<void> {
  stopAgentSpeech()
  const blob = new Blob([buffer], { type: 'audio/wav' })
  const url = URL.createObjectURL(blob)
  const audio = new Audio(url)
  currentAudio = audio

  await new Promise<void>((resolve, reject) => {
    const finish = () => {
      URL.revokeObjectURL(url)
      if (currentAudio === audio) currentAudio = null
      resolve()
    }
    audio.onended = finish
    audio.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Audio playback failed'))
    }
    void audio.play().catch(reject)
  })
}

async function fetchBackendSpeech(callId: string, text: string): Promise<ArrayBuffer | null> {
  if (shouldMockModule('calls')) return null

  const token = storageService.getAccessToken()
  const res = await fetch(`${API_BASE_URL}/calls/${callId}/speak`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ text }),
  })

  if (!res.ok) return null
  const buf = await res.arrayBuffer()
  return buf.byteLength > 44 ? buf : null
}

function speakBrowserChunk(
  chunk: string,
  voice: SpeechSynthesisVoice | null,
  rate: number,
  pitch: number,
): Promise<void> {
  return new Promise((resolve) => {
    const utter = new SpeechSynthesisUtterance(chunk)
    if (voice) utter.voice = voice
    utter.rate = rate
    utter.pitch = pitch
    utter.onend = () => resolve()
    utter.onerror = () => resolve()
    window.speechSynthesis.speak(utter)
  })
}

async function speakBrowser(
  text: string,
  options: { rate?: number; pitch?: number; lang?: string },
): Promise<void> {
  if (!('speechSynthesis' in window)) return

  const voices = voicesReady ? window.speechSynthesis.getVoices() : await waitForVoices()
  const femaleVoice = pickFemaleBrowserVoice(voices, options.lang ?? 'en-US')
  const rate = options.rate ?? 0.94
  const pitch = options.pitch ?? 1.06
  const chunks = splitSpeechChunks(text)

  stopAgentSpeech()
  for (const chunk of chunks) {
    await speakBrowserChunk(chunk, femaleVoice, rate, pitch)
    await new Promise((r) => setTimeout(r, 35))
  }
}

export interface SpeakAgentOptions {
  callId?: string
  enabled?: boolean
  voice?: string
  rate?: number
  pitch?: number
  lang?: string
  onStart?: () => void
  preferBackend?: boolean
}

export async function speakAgentText(text: string, options: SpeakAgentOptions = {}): Promise<void> {
  const enabled = options.enabled ?? true
  if (!enabled || !text.trim()) return

  const spoken = humanizeForSpeech(text)
  if (!spoken) return

  options.onStart?.()

  const chunks = splitSpeechChunks(spoken)
  const preferBackend = options.preferBackend !== false && Boolean(options.callId)

  if (preferBackend && options.callId) {
    const callId = options.callId
    const fetched = await Promise.all(
      chunks.map(async (chunk) => {
        try {
          return await fetchBackendSpeech(callId, chunk)
        } catch {
          return null
        }
      }),
    )
    for (let i = 0; i < chunks.length; i++) {
      const buf = fetched[i]
      if (buf) {
        await playWavBuffer(buf)
      } else {
        await speakBrowser(chunks[i], options)
      }
    }
    return
  }

  await speakBrowser(spoken, options)
}

/** Preload browser voices on chat mount. */
export function preloadSpeechVoices() {
  if ('speechSynthesis' in window) {
    void waitForVoices()
  }
}

export function getAgentDisplayName(agentName: string, voice?: string): string {
  if ((voice ?? 'sarah').toLowerCase().includes('sarah')) {
    return agentName.toLowerCase().includes('sarah') ? agentName : `${agentName} (Sarah)`
  }
  return agentName
}
