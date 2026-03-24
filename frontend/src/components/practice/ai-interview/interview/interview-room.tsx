// src/components/practice/ai-interview/interview/interview-room.tsx
// Mirrors mock-drive's interview-module.tsx architecture:
//  - hasBegun overlay to unlock AudioContext via user gesture
//  - Persistent mic (starts once on Begin, stays on)
//  - isAnswering gate to only send audio when it's user's turn
//  - isPendingPlayback guard prevents premature mic start
//  - 5-second VAD silence auto-submit
//  - Transcript cleared per question turn

'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

// Local component imports
import { AIAvatar } from './ai-avatar';
import { AudioVisualizer } from './audio-visualizer';
import { TranscriptDisplay } from './transcript-display';
import { ProgressBar } from './progress-bar';
import { ConnectionStatus } from './connection-status';
import { EndInterviewDialog } from './end-interview-dialog';

// Store and hooks
import { useInterviewStore } from '@/lib/store/interview-store';
import { useInterviewWebSocket } from '@/lib/contexts/interview-websocket-context';
import { useAudioRecorder } from '@/lib/hooks/use-audio-recorder';
import { useStartSession, useInterviewSession } from '@/lib/hooks/use-interview';

// UI components
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, Mic, MicOff, Play, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

// =====================================================
// TYPES
// =====================================================

interface InterviewRoomProps {
  sessionId: string;
}

// =====================================================
// COMPONENT
// =====================================================

export function InterviewRoom({ sessionId }: InterviewRoomProps) {
  const router = useRouter();

  // ─── Session data ──────────────────────────────────────────────────────────
  const { data: sessionData, isLoading: isSessionLoading } = useInterviewSession(sessionId);

  // ─── Store ─────────────────────────────────────────────────────────────────
  const {
    currentSession,
    messages,
    progress,
    ui: {
      isAISpeaking,
      isProcessing,
      currentTranscript,
      error,
      isConnected,
    },
    setCurrentSession,
    setError,
    setAISpeaking,
  } = useInterviewStore();

  // ─── WebSocket context ─────────────────────────────────────────────────────
  const ws = useInterviewWebSocket();

  // ─── Begin overlay (AudioContext unlock + mic start + WS connect) ──────────
  const [hasBegun, setHasBegun] = useState(false);
  const micStartedRef = useRef(false);
  const hasConnectedRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const hasStartedRef = useRef(false);

  // ─── isAnswering: controls whether we're in user-answer mode ──────────────
  // This is the KEY gate. Audio is only sent to WS when isAnsweringRef = true.
  const [isAnswering, setIsAnswering] = useState(false);
  const isAnsweringRef = useRef(false);
  isAnsweringRef.current = isAnswering;

  // ─── Session start ─────────────────────────────────────────────────────────
  const { mutate: startSession } = useStartSession();

  // ─── Silence timers ────────────────────────────────────────────────────────
  const [silenceCountdown, setSilenceCountdown] = useState<number | null>(null);
  const silenceStartRef = useRef<number | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const silenceIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearSilenceTimers = useCallback(() => {
    if (silenceTimeoutRef.current) { clearTimeout(silenceTimeoutRef.current); silenceTimeoutRef.current = null; }
    if (silenceIntervalRef.current) { clearInterval(silenceIntervalRef.current); silenceIntervalRef.current = null; }
    silenceStartRef.current = null;
    setSilenceCountdown(null);
  }, []);

  // ─── Persistent mic ────────────────────────────────────────────────────────
  // Mic starts ONCE when user clicks "Begin Interview" and stays active.
  // We only send audio data to the server when isAnsweringRef is true.
  const {
    isRecording,
    startRecording: startMicRecording,
    stopRecording: stopMicRecording,
    volume,
    error: recorderError,
    isSupported: isAudioSupported,
  } = useAudioRecorder({
    onAudioData: (audioData) => {
      // Gate: only forward audio when it's the user's turn
      if (ws.isConnected && isAnsweringRef.current) {
        ws.sendAudio(audioData);
      }
    },
    onError: (err) => {
      console.error('[InterviewRoom] Recorder error:', err);
      setError(err);
    },
  });

  // ─── Cleanup ───────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      hasConnectedRef.current = false;
      if (micStartedRef.current) stopMicRecording();
      ws.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Begin Interview ───────────────────────────────────────────────────────
  const handleBeginInterview = useCallback(async () => {
    if (hasConnectedRef.current) return;
    setHasBegun(true);

    // Step 1: Resume AudioContext inside user gesture so TTS audio can play
    await ws.resumeAudioContext();

    // Step 2: Start mic permanently (keeps connection warm between turns)
    if (!micStartedRef.current && !isRecording) {
      micStartedRef.current = true;
      try {
        await startMicRecording();
      } catch {
        micStartedRef.current = false;
      }
    }

    // Step 3: Connect WS after AudioContext is unlocked
    if (!hasConnectedRef.current) {
      hasConnectedRef.current = true;
      ws.connect(sessionId);
    }
  }, [ws, startMicRecording, isRecording, sessionId]);

  // ─── Initialize session on WS connect ─────────────────────────────────────
  useEffect(() => {
    if (sessionData && !hasInitializedRef.current) {
      setCurrentSession(sessionData);
      hasInitializedRef.current = true;

      if (sessionData.status === 'CREATED' && !hasStartedRef.current) {
        hasStartedRef.current = true;
        startSession(sessionId);
      }
    }
  }, [sessionData, sessionId, setCurrentSession, startSession]);

  // ─── End handler: redirect to results ─────────────────────────────────────
  useEffect(() => {
    const unsubscribe = ws.registerEndHandler(() => {
      router.push(`/practice/ai-interview/results/${sessionId}`);
    });
    return unsubscribe;
  }, [ws, router, sessionId]);

  // ─── Submit answer (user's turn ends) ─────────────────────────────────────
  const handleSubmitAnswer = useCallback(() => {
    if (!isAnsweringRef.current) return;
    clearSilenceTimers();
    setIsAnswering(false);
    ws.stopRecording();
  }, [clearSilenceTimers, ws]);

  // ─── isUserTurn: when all conditions align for user to speak ──────────────
  const isUserTurn =
    hasBegun &&
    isConnected &&
    isRecording &&             // mic must be active
    !ws.isPlaying &&           // AI audio must be done
    !ws.isPendingPlayback &&   // audio must have actually started + ended
    !isAISpeaking &&
    !isProcessing;

  const prevIsUserTurnRef = useRef(false);

  useEffect(() => {
    if (isUserTurn && !prevIsUserTurnRef.current) {
      console.log('[InterviewRoom] User turn started');
      setIsAnswering(true);
      ws.startRecording(); // tells backend to start listening + clears transcript
    }
    prevIsUserTurnRef.current = isUserTurn;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUserTurn]);

  // ─── Clear isAnswering when AI takes over ──────────────────────────────────
  useEffect(() => {
    if (isAISpeaking || isProcessing) {
      if (isAnsweringRef.current) {
        setIsAnswering(false);
        clearSilenceTimers();
      }
    }
  }, [isAISpeaking, isProcessing, clearSilenceTimers]);

  // ─── Sync AI speaking state from audio player ──────────────────────────────
  useEffect(() => {
    if (ws.isPlaying || ws.isPendingPlayback) {
      setAISpeaking(true);
    } else if (!isProcessing) {
      setAISpeaking(false);
    }
  }, [ws.isPlaying, ws.isPendingPlayback, isProcessing, setAISpeaking]);

  // ─── VAD: silence-based auto-submit ───────────────────────────────────────
  useEffect(() => {
    const canVAD = isAnswering && !ws.isPlaying && !ws.isPendingPlayback;

    if (canVAD) {
      if (volume < 0.05) {
        if (!silenceStartRef.current) {
          silenceStartRef.current = Date.now();
          setSilenceCountdown(5);
          silenceIntervalRef.current = setInterval(() => {
            const elapsed = (Date.now() - (silenceStartRef.current ?? Date.now())) / 1000;
            setSilenceCountdown(Math.ceil(Math.max(0, 5 - elapsed)));
          }, 200);
          silenceTimeoutRef.current = setTimeout(() => {
            clearSilenceTimers();
            handleSubmitAnswer();
          }, 5000);
        }
      } else {
        clearSilenceTimers();
      }
    } else {
      clearSilenceTimers();
    }
    return clearSilenceTimers;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volume, isAnswering, ws.isPlaying, ws.isPendingPlayback]);

  const handleEndInterview = useCallback(() => {
    stopMicRecording();
    ws.endInterview('completed');
  }, [stopMicRecording, ws]);

  const handleReconnect = useCallback(() => {
    setError(null);
    ws.connect(sessionId);
  }, [ws, sessionId, setError]);

  // ─── Status helpers ────────────────────────────────────────────────────────
  type MicState = 'connecting' | 'disconnected' | 'ai_speaking' | 'ai_thinking' | 'answering' | 'waiting' | 'not_started';

  const getMicState = (): MicState => {
    if (!hasBegun) return 'not_started';
    if (ws.isConnecting) return 'connecting';
    if (!isConnected) return 'disconnected';
    if (ws.isPlaying || ws.isBuffering || ws.isPendingPlayback || isAISpeaking) return 'ai_speaking';
    if (isProcessing) return 'ai_thinking';
    if (isAnswering) return 'answering';
    return 'waiting';
  };

  const micState = getMicState();

  const STATUS: Record<MicState, { text: string; cls: string }> = {
    not_started: { text: 'Click Begin to start', cls: 'text-muted-foreground' },
    connecting: { text: 'Connecting to server...', cls: 'text-yellow-500 animate-pulse' },
    disconnected: { text: 'Connection lost', cls: 'text-red-500' },
    ai_speaking: { text: 'AI is speaking...', cls: 'text-primary animate-pulse' },
    ai_thinking: { text: 'AI is thinking...', cls: 'text-primary/70 animate-pulse' },
    answering: {
      text: silenceCountdown !== null
        ? `Listening — auto-submits in ${silenceCountdown}s`
        : 'Listening... speak your answer',
      cls: silenceCountdown !== null && silenceCountdown <= 1
        ? 'text-orange-500 font-semibold'
        : 'text-red-500 animate-pulse',
    },
    waiting: { text: 'Waiting for AI...', cls: 'text-muted-foreground animate-pulse' },
  };

  const currentStatus = STATUS[micState];

  // =====================================================
  // BEGIN OVERLAY
  // =====================================================

  if (!hasBegun) {
    return (
      <div className="flex flex-col h-screen bg-background items-center justify-center p-8">
        <div className="max-w-md w-full p-8 bg-card rounded-2xl border shadow-lg text-center space-y-5">
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Ready to Begin?</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Make sure your <strong>microphone is connected</strong> and your{' '}
              <strong>volume is turned up</strong>. The AI will speak the first question
              automatically once you click Begin.
            </p>
          </div>

          {currentSession?.config.jobTitle && (
            <p className="text-sm font-medium text-primary">
              {currentSession.config.jobTitle}
              {currentSession.config.companyName && ` at ${currentSession.config.companyName}`}
            </p>
          )}

          <div className="bg-muted/50 rounded-xl p-3 text-sm text-muted-foreground space-y-1">
            <p>🎤 Speak your answer clearly</p>
            <p>⏱️ 5 seconds of silence = auto-submit</p>
            <p>🔘 Tap mic button to submit early</p>
          </div>

          <Button
            size="lg"
            className="w-full h-12 text-base gap-2"
            onClick={handleBeginInterview}
            disabled={hasBegun || isSessionLoading}
          >
            {isSessionLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Loading...</>
            ) : (
              <><Play className="h-4 w-4" />Begin Interview</>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // =====================================================
  // CONNECTING STATE
  // =====================================================

  if (ws.isConnecting && !isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Connecting to interview...</p>
      </div>
    );
  }

  // =====================================================
  // AUDIO NOT SUPPORTED
  // =====================================================

  if (!isAudioSupported) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h1 className="text-xl font-semibold">Audio Not Supported</h1>
        <p className="text-muted-foreground text-center max-w-md">
          Your browser doesn&apos;t support audio recording. Please use Chrome, Firefox, or Safari.
        </p>
        <Button onClick={() => router.push('/practice/ai-interview')}>Go Back</Button>
      </div>
    );
  }

  // =====================================================
  // MAIN INTERVIEW UI
  // =====================================================

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-4">
          <ConnectionStatus isConnected={isConnected} />
          <div>
            <h1 className="text-lg font-semibold">AI Interview</h1>
            {currentSession?.config.jobTitle && (
              <p className="text-sm text-muted-foreground">
                {currentSession.config.jobTitle}
                {currentSession.config.companyName && ` at ${currentSession.config.companyName}`}
              </p>
            )}
          </div>
        </div>
        <EndInterviewDialog onConfirm={handleEndInterview} />
      </header>

      {/* Progress */}
      {progress && (
        <div className="px-6 py-2 border-b">
          <ProgressBar progress={progress} />
        </div>
      )}

      {/* Error Alert */}
      {(error || recorderError) && (
        <Alert variant="destructive" className="mx-6 mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error || recorderError}</span>
            {!isConnected && (
              <Button variant="outline" size="sm" onClick={handleReconnect}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reconnect
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* AI Avatar + Controls Section */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">

          {/* Status label */}
          <p className={cn('text-sm font-medium text-center transition-all min-h-[1.5rem]', currentStatus.cls)}>
            {currentStatus.text}
          </p>

          <AIAvatar
            isSpeaking={ws.isPlaying || ws.isBuffering || ws.isPendingPlayback || isAISpeaking}
            isListening={isAnswering}
            isProcessing={isProcessing}
          />

          <AudioVisualizer
            isActive={isAnswering || ws.isPlaying || isAISpeaking}
            volume={isAnswering ? volume : 0}
            className="mt-4"
          />

          {/* Live italic transcript — only shows user's own words while answering */}
          {isAnswering && currentTranscript && (
            <div className="mt-2 p-4 bg-muted rounded-lg max-w-md animate-in fade-in">
              <p className="text-sm text-muted-foreground italic">&quot;{currentTranscript}&quot;</p>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-col items-center gap-2 mt-4">
            {/* Silence countdown ring */}
            {silenceCountdown !== null && isAnswering ? (
              <div className="relative flex items-center justify-center">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor"
                    className="text-muted-foreground/20" strokeWidth="4" />
                  <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor"
                    className={silenceCountdown <= 1 ? 'text-orange-500' : 'text-red-500'}
                    strokeWidth="4"
                    strokeDasharray={`${2 * Math.PI * 26}`}
                    strokeDashoffset={`${2 * Math.PI * 26 * (silenceCountdown / 5)}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.2s linear' }}
                  />
                </svg>
                <span className={cn('absolute text-base font-bold',
                  silenceCountdown <= 1 ? 'text-orange-500' : 'text-red-500')}>
                  {silenceCountdown}
                </span>
              </div>
            ) : (
              <div className="relative">
                {isAnswering && (
                  <span className="absolute inset-0 rounded-full animate-ping bg-red-400/40" />
                )}
                <Button
                  variant={isAnswering ? 'destructive' : 'default'}
                  size="icon"
                  className={cn(
                    'h-14 w-14 rounded-full shadow-lg transition-all hover:scale-105',
                    isAnswering ? 'bg-red-500 hover:bg-red-600' : ''
                  )}
                  onClick={isAnswering ? handleSubmitAnswer : undefined}
                  disabled={!isAnswering || micState === 'ai_speaking' || micState === 'ai_thinking'}
                  title={isAnswering ? 'Submit answer now' : currentStatus.text}
                >
                  {isProcessing && !isAnswering
                    ? <Loader2 className="h-5 w-5 animate-spin" />
                    : isAnswering
                      ? <MicOff className="h-5 w-5 text-white" />
                      : <Mic className="h-5 w-5" />
                  }
                </Button>
              </div>
            )}

            <p className="text-[11px] text-muted-foreground text-center max-w-[160px] leading-tight">
              {isAnswering ? '5s pause = auto-submit' : currentStatus.text}
            </p>
          </div>

          {/* Disconnected notice */}
          {!isConnected && !ws.isConnecting && hasBegun && (
            <div className="mt-4 p-4 bg-destructive/10 rounded-lg">
              <p className="text-sm text-destructive">
                Connection lost. Click reconnect or refresh the page.
              </p>
            </div>
          )}
        </div>

        {/* Transcript Sidebar */}
        <div className="w-96 border-l hidden lg:block">
          <TranscriptDisplay messages={messages} />
        </div>
      </div>
    </div>
  );
}