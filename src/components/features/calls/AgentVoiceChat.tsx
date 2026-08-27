import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { BackendBrowserSession } from '@/types/backend.types'
import { callDetailPath } from '@/constants/routes.constants'
import { callsService } from '@/services/calls.service'
import { useVoiceInput } from '@/hooks/useVoiceInput'
import {
  getAgentDisplayName,
  preloadSpeechVoices,
  speakAgentText,
  stopAgentSpeech,
} from '@/lib/agent-speech'
import '@/assets/styles/agent-chat.css'

interface AgentVoiceChatProps {
  session: BackendBrowserSession
  agentName: string
  agentGreeting?: string
  agentVoice?: string
  speechRate?: number
  speechPitch?: number
  language?: string
  onLeave?: () => void
}

type Line = { id: string; role: 'agent' | 'you' | 'system'; text: string }
type Phase = 'ready' | 'thinking' | 'speaking' | 'ended'

function MessageBody({ text }: { text: string }) {
  const parts = text.split(/\n{2,}|\n/).filter(Boolean)
  if (parts.length <= 1) {
    return <div className="ai-chat__markdown">{text}</div>
  }
  return (
    <div className="ai-chat__markdown">
      {parts.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  )
}

function resizeTextarea(el: HTMLTextAreaElement | null) {
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, 160)}px`
}

function VoiceCallBar({
  phase,
  agentName,
  conversationMode,
}: {
  phase: Phase | 'listening' | 'waiting'
  agentName: string
  conversationMode: boolean
}) {
  if (!conversationMode || phase === 'ended') return null

  const label =
    phase === 'speaking'
      ? `${agentName} is speaking`
      : phase === 'listening'
        ? 'Your turn — speak now'
        : phase === 'thinking'
          ? 'Thinking…'
          : phase === 'waiting'
            ? 'Almost ready…'
            : 'Live call'

  const orbClass =
    phase === 'speaking'
      ? 'ai-chat__call-orb ai-chat__call-orb--speaking'
      : phase === 'listening'
        ? 'ai-chat__call-orb ai-chat__call-orb--listening'
        : phase === 'thinking'
          ? 'ai-chat__call-orb ai-chat__call-orb--thinking'
          : 'ai-chat__call-orb ai-chat__call-orb--idle'

  return (
    <div className={`ai-chat__call-bar ai-chat__call-bar--${phase}`} role="status">
      <div className={orbClass} aria-hidden>
        <span />
        <span />
        <span />
      </div>
      <div className="ai-chat__call-bar-text">
        <strong>{label}</strong>
        <span>Mic opens automatically after {agentName} finishes speaking</span>
      </div>
    </div>
  )
}

export function AgentVoiceChat({
  session,
  agentName,
  agentGreeting,
  agentVoice = 'sarah',
  speechRate = 0.94,
  speechPitch = 1.06,
  language = 'en-US',
  onLeave,
}: AgentVoiceChatProps) {
  const displayName = getAgentDisplayName(agentName, agentVoice)
  const greeting =
    (session.greeting || agentGreeting || '').trim() ||
    `Hi there! I'm ${displayName}. How can I help you today?`

  const [phase, setPhase] = useState<Phase>('ready')
  const [speakReplies, setSpeakReplies] = useState(true)
  const [conversationMode, setConversationMode] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lines, setLines] = useState<Line[]>([])
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const busyRef = useRef(false)
  const openingRef = useRef(false)
  const lastAgentTextRef = useRef('')
  const phaseRef = useRef(phase)
  const speakRepliesRef = useRef(speakReplies)
  const conversationModeRef = useRef(conversationMode)
  const voiceStartRef = useRef<() => Promise<void>>(async () => undefined)
  const voiceStopRef = useRef<() => void>(() => undefined)

  phaseRef.current = phase
  speakRepliesRef.current = speakReplies
  conversationModeRef.current = conversationMode

  const micBlocked = phase === 'ended' || phase === 'thinking' || phase === 'speaking'

  const pushLine = useCallback((role: Line['role'], text: string) => {
    setLines((prev) => [...prev, { id: `${Date.now()}_${prev.length}`, role, text }])
  }, [])

  const sendMessageRef = useRef<(raw: string) => Promise<void>>(async () => undefined)

  const voice = useVoiceInput({
    disabled: micBlocked,
    lang: language,
    onFinalText: (text) => {
      if (phaseRef.current === 'speaking' || phaseRef.current === 'thinking') return
      if (busyRef.current) return
      const norm = text.trim().toLowerCase()
      if (norm.length < 2) return
      if (lastAgentTextRef.current) {
        const agentNorm = lastAgentTextRef.current.toLowerCase()
        if (agentNorm.includes(norm) || norm.includes(agentNorm.slice(0, 50))) {
          voice.clearProcessing()
          return
        }
      }
      void sendMessageRef.current(text)
    },
  })

  voiceStartRef.current = voice.start
  voiceStopRef.current = voice.stop

  const speakReply = useCallback(
    async (text: string) => {
      lastAgentTextRef.current = text.trim()
      if (!speakRepliesRef.current) {
        setPhase('ready')
        return
      }
      setPhase('speaking')
      await speakAgentText(text, {
        callId: String(session.call_id),
        enabled: true,
        voice: agentVoice,
        rate: speechRate,
        pitch: speechPitch,
        lang: language,
        onStart: () => setPhase('speaking'),
      })
      if (phaseRef.current !== 'ended') setPhase('ready')
    },
    [agentVoice, language, session.call_id, speechPitch, speechRate],
  )

  const sendMessage = useCallback(
    async (raw: string) => {
      const text = raw.trim()
      if (!text || busyRef.current || phaseRef.current === 'ended') return

      busyRef.current = true
      stopAgentSpeech()
      setError(null)
      setPhase('thinking')

      pushLine('you', text)
      setInput('')
      resizeTextarea(inputRef.current)

      try {
        const res = await callsService.turn(String(session.call_id), text)
        if (!res.success || !res.data?.reply) {
          const msg = res.message || 'No reply from the agent.'
          pushLine('system', msg)
          setError(msg)
          setPhase('ready')
          voice.clearProcessing()
          return
        }

        pushLine('agent', res.data.reply)
        await speakReply(res.data.reply)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Could not reach the API'
        const friendly = /fetch|network|ECONNREFUSED|8000/i.test(msg)
          ? 'Backend API is not running. Start uvicorn on port 8000.'
          : /ollama|11434/i.test(msg)
            ? 'Ollama is not running. Run: ollama pull llama3.1'
            : msg
        pushLine('system', friendly)
        setError(friendly)
        setPhase('ready')
        voice.clearProcessing()
      } finally {
        busyRef.current = false
      }
    },
    [pushLine, session.call_id, speakReply, voice],
  )

  sendMessageRef.current = sendMessage

  useEffect(() => {
    preloadSpeechVoices()
  }, [])

  useEffect(() => {
    if (voice.error) setError(voice.error)
  }, [voice.error])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [lines, phase, voice.interimText])

  useEffect(() => {
    if (openingRef.current) return
    openingRef.current = true

    const openConversation = async () => {
      pushLine('agent', greeting)
      if (conversationModeRef.current) {
        await speakReply(greeting)
        await voiceStartRef.current()
      } else {
        inputRef.current?.focus()
      }
    }

    void openConversation()
  }, [greeting, pushLine, speakReply])

  useEffect(() => {
    resizeTextarea(inputRef.current)
  }, [input, voice.interimText])

  const toggleVoiceMute = () => {
    if (phase === 'speaking') {
      stopAgentSpeech()
      setPhase('ready')
      voice.scheduleResume(0)
      return
    }
    if (voice.isVoiceActive) {
      voice.stop()
      setError(null)
    } else {
      void voice.start()
    }
  }

  const endCall = async () => {
    voiceStopRef.current()
    stopAgentSpeech()
    setPhase('ended')
    try {
      await callsService.end(String(session.call_id))
    } catch {
      // ignore
    }
    onLeave?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && input.trim() && !voice.isListening) {
      e.preventDefault()
      void sendMessage(input)
    }
  }

  useEffect(() => {
    return () => {
      voiceStopRef.current()
      stopAgentSpeech()
    }
  }, [])

  const displayInput = voice.interimText || input
  const isListening = voice.isListening
  const micLive = voice.isVoiceActive && conversationMode

  type VoicePhase = 'listening' | 'waiting' | Phase
  const voicePhase: VoicePhase = isListening
    ? 'listening'
    : micLive && micBlocked
      ? 'waiting'
      : phase

  const statusPillClass =
    phase === 'thinking'
      ? 'ai-chat__status-pill ai-chat__status-pill--thinking'
      : phase === 'speaking'
        ? 'ai-chat__status-pill ai-chat__status-pill--speaking'
        : isListening
          ? 'ai-chat__status-pill ai-chat__status-pill--listening'
          : micLive
            ? 'ai-chat__status-pill ai-chat__status-pill--live'
            : 'ai-chat__status-pill'

  const statusText =
    phase === 'thinking'
      ? 'Thinking'
      : phase === 'speaking'
        ? 'Speaking'
        : phase === 'ended'
          ? 'Ended'
          : isListening
            ? 'Listening'
            : micLive
              ? micBlocked
                ? 'Waiting'
                : 'Mic on'
              : 'Muted'

  return (
    <div className="ai-chat">
      <header className="ai-chat__topbar">
        <Link
          to={callDetailPath(String(session.call_id))}
          className="ai-chat__topbar-btn"
          title="Call details"
          aria-label="Call details"
        >
          <i className="ri-file-list-3-line" />
        </Link>

        <div className="ai-chat__topbar-center">
          <h2 className="ai-chat__topbar-title">{displayName}</h2>
          <p className="ai-chat__topbar-meta">
            <span className={statusPillClass}>{statusText}</span>
            <span>Call #{session.call_id}</span>
          </p>
        </div>

        {phase !== 'ended' ? (
          <button
            type="button"
            className="ai-chat__topbar-btn ai-chat__topbar-btn--danger"
            title="End conversation"
            aria-label="End conversation"
            onClick={() => void endCall()}
          >
            <i className="ri-phone-fill" />
          </button>
        ) : (
          <span style={{ width: 34 }} aria-hidden />
        )}
      </header>

      <VoiceCallBar phase={voicePhase} agentName={displayName} conversationMode={conversationMode} />

      <div className="ai-chat__viewport">
        <div className="ai-chat__thread">
          {lines.map((line, index) => {
            if (line.role === 'system') {
              return (
                <div
                  key={line.id}
                  className="ai-chat__turn ai-chat__turn--system"
                  style={{ animationDelay: `${Math.min(index * 30, 120)}ms` }}
                >
                  <div className="ai-chat__system-msg">{line.text}</div>
                </div>
              )
            }
            if (line.role === 'you') {
              return (
                <div
                  key={line.id}
                  className="ai-chat__turn ai-chat__turn--user"
                  style={{ animationDelay: `${Math.min(index * 30, 120)}ms` }}
                >
                  <div className="ai-chat__content">
                    <div className="ai-chat__bubble-user">{line.text}</div>
                  </div>
                  <div className="ai-chat__avatar ai-chat__avatar--user" aria-hidden>
                    <i className="ri-user-3-fill" />
                  </div>
                </div>
              )
            }
            return (
              <div
                key={line.id}
                className="ai-chat__turn ai-chat__turn--agent"
                style={{ animationDelay: `${Math.min(index * 30, 120)}ms` }}
              >
                <div
                  className={`ai-chat__avatar ai-chat__avatar--agent ${
                    phase === 'speaking' ? 'ai-chat__avatar--speaking' : ''
                  }`}
                  aria-hidden
                >
                  <i className="ri-user-voice-fill" />
                </div>
                <div className="ai-chat__content">
                  <div className="ai-chat__role-label">{displayName}</div>
                  <MessageBody text={line.text} />
                </div>
              </div>
            )
          })}

          {phase === 'thinking' && (
            <div className="ai-chat__typing" aria-label={`${displayName} is typing`}>
              <div
                className="ai-chat__avatar ai-chat__avatar--agent ai-chat__avatar--speaking"
                aria-hidden
              >
                <i className="ri-user-voice-fill" />
              </div>
              <div className="ai-chat__typing-bubble">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}

          {isListening && voice.interimText && (
            <div className="ai-chat__turn ai-chat__turn--user ai-chat__turn--interim">
              <div className="ai-chat__content">
                <div className="ai-chat__bubble-user ai-chat__bubble-user--interim">
                  {voice.interimText}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {phase === 'ended' ? (
        <div className="ai-chat__ended">
          <p className="text-textmuted mb-3">Conversation ended.</p>
          <button type="button" className="ti-btn ti-btn-primary" onClick={() => onLeave?.()}>
            New chat
          </button>
        </div>
      ) : (
        <footer className="ai-chat__dock">
          <div className="ai-chat__dock-inner">
            {isListening && (
              <div className="ai-chat__listening" role="status">
                <span className="ai-chat__mic-ring" aria-hidden />
                <span>{voice.interimText || 'Speak now — brief pause sends your message'}</span>
              </div>
            )}

            {phase === 'speaking' && (
              <div className="ai-chat__listening ai-chat__listening--agent" role="status">
                <i className="ri-volume-up-fill" />
                <span>{displayName} is speaking — mic opens when they finish</span>
              </div>
            )}

            {phase === 'thinking' && (
              <div className="ai-chat__listening ai-chat__listening--thinking" role="status">
                <i className="ri-loader-4-line animate-spin" />
                <span>Getting {displayName}&apos;s reply…</span>
              </div>
            )}

            {micLive && !isListening && phase === 'ready' && (
              <div className="ai-chat__listening ai-chat__listening--ready" role="status">
                <i className="ri-mic-fill" />
                <span>Mic live — start speaking anytime</span>
              </div>
            )}

            {error && <div className="ai-chat__error">{error}</div>}

            <div
              className={`ai-chat__input-shell ${
                isListening
                  ? 'ai-chat__input-shell--voice'
                  : phase === 'speaking'
                    ? 'ai-chat__input-shell--speaking'
                    : micLive && phase === 'ready'
                      ? 'ai-chat__input-shell--live'
                      : ''
              }`}
            >
              <textarea
                ref={inputRef}
                className="ai-chat__textarea"
                placeholder={
                  conversationMode ? 'Or type here — mic is hands-free' : 'Message…'
                }
                rows={1}
                value={displayInput}
                disabled={phase === 'thinking' || isListening}
                onChange={(e) => {
                  if (!isListening) setInput(e.target.value)
                }}
                onKeyDown={handleKeyDown}
              />
              <div className="ai-chat__dock-tools">
                <button
                  type="button"
                  className={`ai-chat__tool-btn ai-chat__tool-btn--mic ${
                    micLive ? 'ai-chat__tool-btn--live' : ''
                  } ${isListening ? 'ai-chat__tool-btn--active' : ''}`}
                  disabled={phase === 'thinking' || voice.status === 'requesting'}
                  title={micLive ? 'Mute mic' : 'Unmute mic'}
                  aria-label={micLive ? 'Mute mic' : 'Unmute mic'}
                  aria-pressed={micLive}
                  onClick={toggleVoiceMute}
                >
                  <i className={`ri-mic-${micLive || isListening ? 'fill' : 'off-line'}`} />
                </button>
                <button
                  type="button"
                  className="ai-chat__tool-btn ai-chat__tool-btn--send"
                  disabled={!input.trim() || phase === 'thinking' || isListening}
                  title="Send"
                  aria-label="Send message"
                  onClick={() => void sendMessage(input)}
                >
                  <i className="ri-arrow-up-line" />
                </button>
              </div>
            </div>

            <div className="ai-chat__dock-footer">
              <label className="ai-chat__toggle">
                <input
                  type="checkbox"
                  checked={conversationMode}
                  onChange={(e) => {
                    const on = e.target.checked
                    setConversationMode(on)
                    if (on) void voice.start()
                    else voice.stop()
                  }}
                />
                Hands-free call
              </label>
              <label className="ai-chat__toggle">
                <input
                  type="checkbox"
                  checked={speakReplies}
                  onChange={(e) => setSpeakReplies(e.target.checked)}
                />
                {displayName} speaks
              </label>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}

export function AgentChatStartHero({
  agentName,
  canTest,
  apiOffline,
  apiDetail,
  starting,
  onStart,
}: {
  agentName: string
  canTest: boolean
  apiOffline: boolean
  apiDetail?: string | null
  starting: boolean
  onStart: () => void
}) {
  return (
    <div className="ai-chat-start">
      <div className="ai-chat-start__logo">
        <i className="ri-phone-voice-fill" />
      </div>
      <h3 className="ai-chat-start__title">{agentName}</h3>
      <p className="text-textmuted mb-0" style={{ maxWidth: 420 }}>
        {agentName} speaks first → you talk → they reply. Mic opens automatically each turn.
      </p>

      <div className="ai-chat-start__grid">
        {[`${agentName} speaks first`, 'Auto mic each turn', 'No echo overlap', 'Natural pacing'].map(
          (t) => (
            <div
              key={t}
              className="ai-chat__suggestion"
              style={{ cursor: 'default', textAlign: 'center' }}
            >
              <span className="ai-chat__suggestion-label">{t}</span>
            </div>
          ),
        )}
      </div>

      {!canTest && (
        <div className="alert alert-warning py-2 fs-13 mb-3" style={{ maxWidth: 420 }}>
          Publish this agent first.
        </div>
      )}

      {apiOffline && (
        <div className="alert alert-danger py-2 fs-13 mb-3 text-start" style={{ maxWidth: 420 }}>
          <strong>Backend offline.</strong>
          <div className="mt-1 fs-12">{apiDetail}</div>
        </div>
      )}

      <button
        type="button"
        className="ti-btn ti-btn-primary ti-btn-lg px-5"
        disabled={!canTest || apiOffline || starting}
        onClick={onStart}
      >
        {starting ? 'Connecting…' : 'Start conversation'}
      </button>
      <p className="text-textmuted fs-12 mt-3 mb-0">Allow microphone once at the start</p>
    </div>
  )
}
