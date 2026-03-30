'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInterviewWebSocket } from '@/lib/contexts/interview-websocket-context';
import { useInterviewStore } from '@/lib/store/interview-store';
import { useInterviewSession, useStartSession } from '@/lib/hooks/use-interview';
import { useAudioRecorder } from '@/lib/hooks/use-audio-recorder';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AIAvatar } from './ai-avatar';
import { AudioVisualizer } from './audio-visualizer';
import { TranscriptDisplay } from '@/components/practice/ai-interview/interview/transcript-display';
import { ProgressBar } from '@/components/practice/ai-interview/interview/progress-bar';
import { ConnectionStatus } from '@/components/practice/ai-interview/interview/connection-status';
import { EndInterviewDialog } from '@/components/practice/ai-interview/interview/end-interview-dialog';
import { AlertCircle, Loader2, Mic, MicOff, Play, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MockDriveInterviewRoomProps {
  sessionId: string;
  backPath: string;
  resultsPath: string;
}

export function MockDriveInterviewRoom({
  sessionId,
  backPath,
  resultsPath,
}: MockDriveInterviewRoomProps) {
  const router = useRouter();
  const ws = useInterviewWebSocket();
  const { data: sessionData, isLoading: isSessionLoading } = useInterviewSession(sessionId);
  const { mutate: startSession } = useStartSession();

  // FIX: removed unused `currentSession` destructuring
  const {
    messages,
    progress,
    ui: { isAISpeaking, isProcessing, currentTranscript, error, isConnected },
    setCurrentSession,
    setError,
    setAISpeaking,
  } = useInterviewStore();

  const [hasBegun, setHasBegun] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const [silenceCountdown, setSilenceCountdown] = useState<number | null>(null);

  useEffect(() => {
    console.log('[MockDriveInterviewRoom] Mounted', { sessionId });
    return () => {
      console.log('[MockDriveInterviewRoom] Unmounted', { sessionId });
    };
  }, [sessionId]);
  const hasConnectedRef = useRef(false);
  const micStartedRef = useRef(false);
  const isAnsweringRef = useRef(false);
  const silenceStartRef = useRef<number | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const silenceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  isAnsweringRef.current = isAnswering;

  const clearSilenceTimers = useCallback(() => {
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    if (silenceIntervalRef.current) clearInterval(silenceIntervalRef.current);
    silenceTimeoutRef.current = null;
    silenceIntervalRef.current = null;
    silenceStartRef.current = null;
    setSilenceCountdown(null);
  }, []);

  const {
    isRecording,
    startRecording: startMicRecording,
    stopRecording: stopMicRecording,
    volume,
    error: recorderError,
    isSupported: isAudioSupported,
  } = useAudioRecorder({
    onAudioData: (audioData) => {
      if (ws.isConnected && isAnsweringRef.current) ws.sendAudio(audioData);
    },
    onError: (err) => setError(err),
  });

  // FIX: keep refs to latest cleanup functions so the unmount
  // effect never calls stale versions
  const cleanupRef = useRef({
    stopMicRecording,
    wsDisconnect: ws.disconnect,
    clearSilenceTimers,
  });
  useEffect(() => {
    cleanupRef.current = {
      stopMicRecording,
      wsDisconnect: ws.disconnect,
      clearSilenceTimers,
    };
  });

  const hasInitializedRef = useRef(false);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (sessionData && !hasInitializedRef.current) {
      setCurrentSession(sessionData);
      hasInitializedRef.current = true;
      if (sessionData.status === 'CREATED' && !hasStartedRef.current) {
        hasStartedRef.current = true;
        startSession(sessionId);
      }
    }
  }, [sessionData, setCurrentSession, startSession, sessionId]);

  useEffect(() => {
    const unsubscribe = ws.registerEndHandler(() => {
      router.replace(resultsPath);
    });
    return unsubscribe;
  }, [ws, router, resultsPath]);

  // FIX: unmount cleanup now uses refs so closures are never stale
  useEffect(() => {
    return () => {
      hasConnectedRef.current = false;
      // Unmount cleanup only.
      if (micStartedRef.current) cleanupRef.current.stopMicRecording();
      cleanupRef.current.wsDisconnect();
      cleanupRef.current.clearSilenceTimers();
    };
  }, []);

  const handleBeginInterview = useCallback(async () => {
    console.log('[MockDriveInterviewRoom] Begin clicked', { sessionId });
    if (hasConnectedRef.current) return;
    setHasBegun(true);
    await ws.resumeAudioContext();
    if (!micStartedRef.current && !isRecording) {
      micStartedRef.current = true;
      try {
        await startMicRecording();
      } catch {
        micStartedRef.current = false;
      }
    }
    hasConnectedRef.current = true;
    console.log('[MockDriveInterviewRoom] Connecting WS', { sessionId });
    ws.connect(sessionId);
  }, [ws, isRecording, startMicRecording, sessionId]);

  const handleSubmitAnswer = useCallback(() => {
    if (!isAnsweringRef.current) return;
    clearSilenceTimers();
    setIsAnswering(false);
    ws.stopRecording();
  }, [clearSilenceTimers, ws]);

  const isUserTurn =
    hasBegun &&
    isConnected &&
    isRecording &&
    !ws.isPlaying &&
    !ws.isPendingPlayback &&
    !isAISpeaking &&
    !isProcessing;

  const prevIsUserTurnRef = useRef(false);
  useEffect(() => {
    if (isUserTurn && !prevIsUserTurnRef.current) {
      setIsAnswering(true);
      ws.startRecording();
    }
    prevIsUserTurnRef.current = isUserTurn;
  }, [isUserTurn, ws]);

  useEffect(() => {
    if (isAISpeaking || isProcessing) {
      if (isAnsweringRef.current) {
        setIsAnswering(false);
        clearSilenceTimers();
      }
    }
  }, [isAISpeaking, isProcessing, clearSilenceTimers]);

  useEffect(() => {
    if (ws.isPlaying || ws.isPendingPlayback) setAISpeaking(true);
    else if (!isProcessing) setAISpeaking(false);
  }, [ws.isPlaying, ws.isPendingPlayback, isProcessing, setAISpeaking]);

  // FIX: Voice Activity Detection — auto-submit after 5 s silence
  // Removed `return clearSilenceTimers`.  The old cleanup ran on every
  // `volume` change, which reset the 5 s timeout before it could fire.
  // Timers are already cleared explicitly when:
  //   • canVAD becomes false (answering stops / AI speaks)
  //   • volume rises above threshold (speech detected)
  //   • handleSubmitAnswer is called
  //   • component unmounts (via the unmount cleanup effect above)
  useEffect(() => {
    const canVAD = isAnswering && !ws.isPlaying && !ws.isPendingPlayback;
    if (!canVAD) {
      clearSilenceTimers();
      return;
    }
    if (volume < 0.05) {
      if (!silenceStartRef.current) {
        silenceStartRef.current = Date.now();
        setSilenceCountdown(5);
        silenceIntervalRef.current = setInterval(() => {
          const elapsed =
            (Date.now() - (silenceStartRef.current ?? Date.now())) / 1000;
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
    // intentionally no cleanup return — see comment above
  }, [
    volume,
    isAnswering,
    ws.isPlaying,
    ws.isPendingPlayback,
    clearSilenceTimers,
    handleSubmitAnswer,
  ]);

  const handleEndInterview = useCallback(() => {
    stopMicRecording();
    ws.endInterview('completed');
  }, [stopMicRecording, ws]);

  const handleReconnect = useCallback(async () => {
    console.log('[MockDriveInterviewRoom] Reconnect clicked', { sessionId });
    setError(null);
    ws.connect(sessionId);
  }, [setError, ws, sessionId]);

  type MicState =
    | 'connecting'
    | 'disconnected'
    | 'ai_speaking'
    | 'ai_thinking'
    | 'answering'
    | 'waiting'
    | 'not_started';

  const micState: MicState = !hasBegun
    ? 'not_started'
    : ws.isConnecting
      ? 'connecting'
      : !isConnected
        ? 'disconnected'
        : ws.isPlaying || ws.isBuffering || ws.isPendingPlayback || isAISpeaking
          ? 'ai_speaking'
          : isProcessing
            ? 'ai_thinking'
            : isAnswering
              ? 'answering'
              : 'waiting';

  const STATUS: Record<MicState, { text: string; cls: string }> = {
    not_started: {
      text: 'Click Begin to start',
      cls: 'text-muted-foreground',
    },
    connecting: {
      text: 'Connecting to server...',
      cls: 'text-yellow-500 animate-pulse',
    },
    disconnected: { text: 'Connection lost', cls: 'text-red-500' },
    ai_speaking: {
      text: 'AI is speaking...',
      cls: 'text-primary animate-pulse',
    },
    ai_thinking: {
      text: 'AI is thinking...',
      cls: 'text-primary/70 animate-pulse',
    },
    answering: {
      text:
        silenceCountdown !== null
          ? `Listening — auto-submits in ${silenceCountdown}s`
          : 'Listening... speak your answer',
      cls:
        silenceCountdown !== null && silenceCountdown <= 1
          ? 'text-orange-500 font-semibold'
          : 'text-red-500 animate-pulse',
    },
    waiting: {
      text: 'Waiting for AI...',
      cls: 'text-muted-foreground animate-pulse',
    },
  };
  const currentStatus = STATUS[micState];

  // ── Pre-interview gate ──────────────────────────────
  if (!hasBegun) {
    return (
      <div className="flex flex-col h-screen bg-background items-center justify-center p-8">
        <div className="max-w-md w-full p-8 bg-card rounded-2xl border shadow-lg text-center space-y-5">
          <h2 className="text-xl font-bold">Ready to Begin?</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Make sure your <strong>microphone is connected</strong> and your{' '}
            <strong>volume is turned up</strong>.
          </p>
          <Button
            size="lg"
            className="w-full h-12 text-base gap-2"
            onClick={handleBeginInterview}
            disabled={hasBegun || isSessionLoading}
          >
            {isSessionLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Begin Interview
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  if (ws.isConnecting && !isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">
          Connecting to interview...
        </p>
      </div>
    );
  }

  if (!isAudioSupported) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h1 className="text-xl font-semibold">Audio Not Supported</h1>
        <Button onClick={() => router.push(backPath)}>Go Back</Button>
      </div>
    );
  }

  // ── Main interview UI ──────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-4">
          <ConnectionStatus isConnected={isConnected} />
          <h1 className="text-lg font-semibold">AI Interview</h1>
        </div>
        <EndInterviewDialog onConfirm={handleEndInterview} />
      </header>

      {progress && (
        <div className="px-6 py-2 border-b">
          <ProgressBar progress={progress} />
        </div>
      )}

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

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
          <p
            className={cn(
              'text-sm font-medium text-center transition-all min-h-[1.5rem]',
              currentStatus.cls,
            )}
          >
            {currentStatus.text}
          </p>
          <AIAvatar
            isSpeaking={
              ws.isPlaying ||
              ws.isBuffering ||
              ws.isPendingPlayback ||
              isAISpeaking
            }
            isListening={isAnswering}
            isProcessing={isProcessing}
          />
          <AudioVisualizer
            isActive={isAnswering || ws.isPlaying || isAISpeaking}
            volume={isAnswering ? volume : 0}
            className="mt-4"
          />
          {isAnswering && currentTranscript && (
            <div className="mt-2 p-4 bg-muted rounded-lg max-w-md animate-in fade-in">
              <p className="text-sm text-muted-foreground italic">
                &quot;{currentTranscript}&quot;
              </p>
            </div>
          )}
          <Button
            variant={isAnswering ? 'destructive' : 'default'}
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg transition-all hover:scale-105"
            onClick={isAnswering ? handleSubmitAnswer : undefined}
            disabled={
              !isAnswering ||
              micState === 'ai_speaking' ||
              micState === 'ai_thinking'
            }
          >
            {isProcessing && !isAnswering ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isAnswering ? (
              <MicOff className="h-5 w-5 text-white" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
        </div>
        <div className="w-96 border-l hidden lg:block">
          <TranscriptDisplay messages={messages} />
        </div>
      </div>
    </div>
  );
}
