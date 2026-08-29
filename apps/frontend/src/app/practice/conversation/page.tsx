'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { practiceApi, speechApi } from '@/lib/api';
import type { PracticeSession, PracticeMessage, Correction } from '@/types';
import { ChatThread } from '@/components/chat/ChatThread';
import { MicButton } from '@/components/speech/MicButton';
import { useAudioRecorder } from '@/components/speech/useAudioRecorder';
import { SessionSummary } from '@/components/practice/SessionSummary';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';

export default function ConversationPage() {
  const router = useRouter();

  const [session, setSession] = useState<PracticeSession | null>(null);
  const [messages, setMessages] = useState<PracticeMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentCorrection, setCurrentCorrection] = useState<Correction | null>(null);
  const [isEnded, setIsEnded] = useState(false);
  const [summary, setSummary] = useState<unknown>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState('');
  const [textInput, setTextInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const { state: micState, audioBlob, startRecording, stopRecording, reset: resetMic } = useAudioRecorder();
  const textareaRef = useRef<HTMLInputElement>(null);

  // Initialize session
  useEffect(() => {
    practiceApi
      .createSession('CONVERSATION')
      .then((res) => {
        const { session: s, aiMessage } = res.data.data;
        setSession(s);
        const firstMsg: PracticeMessage = {
          id: `ai-init-${Date.now()}`,
          sessionId: s.id,
          role: 'ASSISTANT',
          content: aiMessage,
          createdAt: new Date().toISOString(),
        };
        setMessages([firstMsg]);
      })
      .catch(() => setInitError('Failed to start session. Please try again.'))
      .finally(() => setIsInitializing(false));
  }, []);

  // Handle audio blob when recording stops
  useEffect(() => {
    if (audioBlob && session) {
      (async () => {
        try {
          const res = await speechApi.transcribe(audioBlob, session.id);
          const { transcript, correction } = res.data.data;

          const userMsg: PracticeMessage = {
            id: `user-${Date.now()}`,
            sessionId: session.id,
            role: 'USER',
            content: transcript,
            createdAt: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, userMsg]);

          if (correction) setCurrentCorrection(correction);

          // Get AI response
          setIsTyping(true);
          const msgRes = await practiceApi.sendMessage(session.id, transcript);
          const { userMessage, aiMessage, correction: aiCorrection } = msgRes.data.data;
          // Replace temp user message with server one
          setMessages((prev) => [
            ...prev.filter((m) => m.id !== userMsg.id),
            userMessage,
            aiMessage,
          ]);
          if (aiCorrection) setCurrentCorrection(aiCorrection);
        } catch (err) {
          console.error('Transcription error:', err);
        } finally {
          setIsTyping(false);
          resetMic();
        }
      })();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioBlob]);

  async function sendTextMessage() {
    if (!textInput.trim() || !session || isSending) return;
    const content = textInput.trim();
    setTextInput('');
    setIsSending(true);
    setCurrentCorrection(null);

    const tempMsg: PracticeMessage = {
      id: `user-temp-${Date.now()}`,
      sessionId: session.id,
      role: 'USER',
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);
    setIsTyping(true);

    try {
      const res = await practiceApi.sendMessage(session.id, content);
      const { userMessage, aiMessage, correction } = res.data.data;
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempMsg.id),
        userMessage,
        aiMessage,
      ]);
      if (correction) setCurrentCorrection(correction);
    } catch (err) {
      console.error('Send message error:', err);
      setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
    } finally {
      setIsTyping(false);
      setIsSending(false);
    }
  }

  async function endSession() {
    if (!session) return;
    try {
      const res = await practiceApi.endSession(session.id);
      setSummary(res.data.data.summary);
      setIsEnded(true);
    } catch (err) {
      console.error('End session error:', err);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendTextMessage();
    }
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Starting your session...</p>
        </div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{initError}</p>
          <Button onClick={() => router.push('/practice')}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (isEnded) {
    return (
      <SessionSummary
        summary={summary}
        onNewSession={() => {
          setIsEnded(false);
          setSummary(null);
          setSession(null);
          setMessages([]);
          setCurrentCorrection(null);
          setIsInitializing(true);
          practiceApi
            .createSession('CONVERSATION')
            .then((res) => {
              const { session: s, aiMessage } = res.data.data;
              setSession(s);
              setMessages([
                {
                  id: `ai-init-${Date.now()}`,
                  sessionId: s.id,
                  role: 'ASSISTANT',
                  content: aiMessage,
                  createdAt: new Date().toISOString(),
                },
              ]);
            })
            .finally(() => setIsInitializing(false));
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] max-w-2xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/practice')}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mr-1"
          >
            ‹
          </button>
          <span className="text-lg">💬</span>
          <h1 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">AI Conversation</h1>
        </div>
        <button
          onClick={endSession}
          className="text-xs text-red-500 hover:text-red-700 font-medium border border-red-200 dark:border-red-800 rounded-lg px-3 py-1.5 transition-colors"
        >
          End Session
        </button>
      </div>

      {/* Chat */}
      <ChatThread
        messages={messages}
        isTyping={isTyping}
        latestCorrection={currentCorrection}
        onRetry={() => setCurrentCorrection(null)}
      />

      {/* Input area */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 pb-safe">
        <div className="flex items-center gap-3">
          <input
            ref={textareaRef}
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 border border-transparent focus:border-primary/30"
            disabled={isSending || micState !== 'idle'}
          />
          <button
            onClick={sendTextMessage}
            disabled={!textInput.trim() || isSending || micState !== 'idle'}
            className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 transition-colors flex-shrink-0"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
          <div className="flex-shrink-0">
            <MicButton
              state={micState}
              onStart={startRecording}
              onStop={stopRecording}
              disabled={isSending}
            />
          </div>
        </div>
        {micState === 'recording' && (
          <p className="text-xs text-red-500 text-center mt-2 animate-pulse">
            Recording... tap to stop
          </p>
        )}
        {micState === 'processing' && (
          <p className="text-xs text-gray-400 text-center mt-2">Processing audio...</p>
        )}
      </div>
    </div>
  );
}
