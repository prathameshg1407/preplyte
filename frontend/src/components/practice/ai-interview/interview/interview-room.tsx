// src/components/practice/ai-interview/interview/interview-room.tsx

'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

// Local component imports
import { AIAvatar } from './ai-avatar';
import { AudioVisualizer } from './audio-visualizer';
import { TranscriptDisplay } from './transcript-display';
import { InterviewControls } from './interview-controls';
import { ProgressBar } from './progress-bar';
import { ConnectionStatus } from './connection-status';
import { EndInterviewDialog } from './end-interview-dialog';

// Store and hooks
import { useInterviewStore } from '@/lib/store/interview-store';
import { useInterviewWebSocket } from '@/lib/contexts/interview-websocket-context';
import { useAudioRecorder } from '@/lib/hooks/use-audio-recorder';
import { useAudioPlayer } from '@/lib/hooks/use-audio-player';
import { useStartSession, useInterviewSession } from '@/lib/hooks/use-interview';

// UI components
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';

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
  const hasInitializedRef = useRef(false);
  const hasStartedRef = useRef(false); // Prevents double-start

  // Fetch session data via REST
  const { data: sessionData, isLoading: isSessionLoading } = useInterviewSession(sessionId);

  // Store
  const {
    currentSession,
    messages,
    progress,
    ui: {
      isRecording,
      isAISpeaking,
      isProcessing,
      currentTranscript,
      error,
      isConnected, // Get connection status from store
    },
    setCurrentSession,
    setError,
    setRecording, 
    setAISpeaking
  } = useInterviewStore();

  // WebSocket from context
  const ws = useInterviewWebSocket();

  // Audio player
  const {
    queueAudio,
    playAccumulated,
    isPlaying,
    isBuffering,
    clear: clearAudioQueue,
  } = useAudioPlayer({
    onPlaybackEnd: () => {
      console.log('[InterviewRoom] Audio playback ended - Starting Mic');
      // FIX: FORCE UI UPDATE AND START MIC
      setAISpeaking(false);
      setRecording(true); 
      startMicRecording(); 
      ws.startRecording();
    },
    onError: (err) => {
      console.error('[InterviewRoom] Audio player error:', err);
    },
  });

  // Audio recorder
  const {
    isRecording: isRecorderActive,
    startRecording: startMicRecording,
    stopRecording: stopMicRecording,
    volume,
    error: recorderError,
    requestPermission,
    isSupported: isAudioSupported,
  } = useAudioRecorder({
    onAudioData: (data) => {
      // Only send if connected to avoid errors
      if (ws.isConnected) {
        ws.sendAudio(data);
      }
    },
    onError: (err) => {
      console.error('[InterviewRoom] Recorder error:', err);
      setError(err);
    },
  });

  // Start session mutation
  const { mutate: startSession } = useStartSession();

  // ===================================================
  // REGISTER HANDLERS
  // ===================================================

  // Register audio handler
  useEffect(() => {
    const unsubscribe = ws.registerAudioHandler((data) => {
      queueAudio(data);
    });
    return unsubscribe;
  }, [ws, queueAudio]);

  // Register AI done handler
  useEffect(() => {
    const unsubscribe = ws.registerAiDoneHandler(() => {
      console.log('[InterviewRoom] AI done, playing accumulated audio');
      playAccumulated();
    });
    return unsubscribe;
  }, [ws, playAccumulated]);

  // Register end handler
  useEffect(() => {
    const unsubscribe = ws.registerEndHandler(() => {
      router.push(`/practice/ai-interview/results/${sessionId}`);
    });
    return unsubscribe;
  }, [ws, router, sessionId]);

  // Register error handler
  useEffect(() => {
    const unsubscribe = ws.registerErrorHandler((err) => {
      console.error('[InterviewRoom] WebSocket error:', err);
    });
    return unsubscribe;
  }, [ws]);

  // ===================================================
  // INITIALIZATION
  // ===================================================

  // Initialize session and connect
  useEffect(() => {
    if (sessionData && !hasInitializedRef.current) {
      setCurrentSession(sessionData);
      hasInitializedRef.current = true;

      // Start session if it's in CREATED state
      // Use ref to ensure we only call this ONCE per mount
      if (sessionData.status === 'CREATED' && !hasStartedRef.current) {
        hasStartedRef.current = true;
        startSession(sessionId);
      }

      // Connect to WebSocket
      ws.connect(sessionId);
    }
  }, [sessionData, sessionId, setCurrentSession, startSession, ws]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAudioQueue();
    };
  }, [clearAudioQueue]);

  // ===================================================
  // RECORDING SYNC
  // ===================================================

  // Sync recording state with WebSocket state
  useEffect(() => {
    const shouldRecord = isRecording && !isAISpeaking && !isProcessing && !isPlaying;
    
    if (shouldRecord && !isRecorderActive) {
      startMicRecording();
    } else if (!shouldRecord && isRecorderActive) {
      stopMicRecording();
    }
  }, [isRecording, isRecorderActive, isAISpeaking, isProcessing, isPlaying, startMicRecording, stopMicRecording]);

  // ===================================================
  // HANDLERS
  // ===================================================

  const handleToggleRecording = useCallback(async () => {
    if (isRecording) {
      stopMicRecording();
      ws.stopRecording();
    } else {
      const hasPermission = await requestPermission();
      if (hasPermission) {
        await startMicRecording();
        ws.startRecording();
      }
    }
  }, [isRecording, startMicRecording, stopMicRecording, ws, requestPermission]);

  const handleEndInterview = useCallback(() => {
    stopMicRecording();
    clearAudioQueue();
    ws.endInterview('completed');
  }, [stopMicRecording, clearAudioQueue, ws]);

  const handleReconnect = useCallback(() => {
    setError(null);
    ws.connect(sessionId);
  }, [ws, sessionId, setError]);

  // ===================================================
  // RENDER STATES
  // ===================================================

  // FIX: Only show Loader if we have NO data AND we aren't connected yet.
  // This allows the UI to render while "Starting" happens in the background.
  if ((isSessionLoading && !currentSession) && !isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Loading session...</p>
      </div>
    );
  }

  // Connecting state (Only show if truly stuck connecting and no UI ready)
  if (ws.isConnecting && !currentSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Connecting to interview...</p>
        {ws.connectionAttempts > 0 && (
          <p className="text-sm text-muted-foreground">
            Attempt {ws.connectionAttempts} of 5
          </p>
        )}
      </div>
    );
  }

  // Audio not supported
  if (!isAudioSupported) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h1 className="text-xl font-semibold">Audio Not Supported</h1>
        <p className="text-muted-foreground text-center max-w-md">
          Your browser doesn&apos;t support audio recording. Please use a modern browser like Chrome,
          Firefox, or Safari.
        </p>
        <Button onClick={() => router.push('/practice/ai-interview')}>Go Back</Button>
      </div>
    );
  }

  // ===================================================
  // MAIN RENDER
  // ===================================================

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-4">
          <ConnectionStatus isConnected={ws.isConnected} />
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
            {!ws.isConnected && (
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
        {/* AI Avatar Section */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <AIAvatar
            isSpeaking={isAISpeaking || isPlaying}
            isListening={isRecording && !isPlaying}
            isProcessing={isProcessing}
          />

          <AudioVisualizer
            isActive={isRecording || isAISpeaking || isPlaying}
            volume={isRecording ? volume : 0}
            className="mt-8"
          />

          {/* Buffering indicator */}
          {isBuffering && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Receiving audio...</span>
            </div>
          )}

          {/* Current Transcript */}
          {currentTranscript && (
            <div className="mt-4 p-4 bg-muted rounded-lg max-w-md animate-in fade-in">
              <p className="text-sm text-muted-foreground italic">&quot;{currentTranscript}&quot;</p>
            </div>
          )}

          {/* Status indicator when not connected */}
          {!ws.isConnected && !ws.isConnecting && (
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

      {/* Controls */}
      <footer className="px-6 py-4 border-t bg-background">
        <InterviewControls
          isRecording={isRecording}
          isAISpeaking={isAISpeaking || isPlaying}
          isProcessing={isProcessing}
          onToggleRecording={handleToggleRecording}
          disabled={!ws.isConnected || isAISpeaking || isPlaying || isProcessing}
        />
      </footer>
    </div>
  );
}