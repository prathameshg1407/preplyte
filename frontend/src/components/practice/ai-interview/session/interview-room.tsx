// src/components/practice/ai-interview/interview/interview-room.tsx

'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AIAvatar } from '../interview/ai-avatar';
import { AudioVisualizer } from '../interview/audio-visualizer';
import { TranscriptDisplay } from '../interview/transcript-display';
import { InterviewControls } from '../interview/interview-controls';
import { ProgressBar } from '../interview/progress-bar';
import { ConnectionStatus } from '../interview/connection-status';
import { EndInterviewDialog } from '../interview/end-interview-dialog';
import { useInterviewStore } from '@/lib/store/interview-store';
import { useInterviewWebSocket } from '@/lib/hooks/use-interview-websocket';
import { useAudioRecorder } from '@/lib/hooks/use-audio-recorder';
import { useAudioPlayer } from '@/lib/hooks/use-audio-player';
import { useStartSession } from '@/lib/hooks/use-interview';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

interface InterviewRoomProps {
  sessionId: string;
}

export function InterviewRoom({ sessionId }: InterviewRoomProps) {
  const router = useRouter();

  // Store
  const {
    currentSession,
    messages,
    progress,
    ui: { isConnected, isConnecting, isRecording, isAISpeaking, isProcessing, currentTranscript, error },
  } = useInterviewStore();

  // Audio player
  const { queueAudio, isPlaying } = useAudioPlayer();

  // WebSocket
  const {
    connect,
    disconnect,
    sendAudio,
    startRecording: wsStartRecording,
    stopRecording: wsStopRecording,
    endInterview,
  } = useInterviewWebSocket({
    sessionId,
    onAudioReceived: queueAudio,
    onInterviewEnded: (feedbackUrl) => {
      router.push(`/practice/ai-interview/results/${sessionId}`);
    },
  });

  // Audio recorder
  const {
    isRecording: isRecorderActive,
    startRecording: startMicRecording,
    stopRecording: stopMicRecording,
    volume,
    error: recorderError,
  } = useAudioRecorder({
    onAudioData: sendAudio,
  });

  // Start session mutation
  const { mutate: startSession, isPending: isStarting } = useStartSession();

  // Connect on mount
  useEffect(() => {
    if (currentSession?.status === 'CREATED') {
      startSession(sessionId);
    }
    connect();

    return () => {
      disconnect();
    };
  }, [sessionId]);

  // Sync recording state
  useEffect(() => {
    if (isRecording && !isRecorderActive && !isAISpeaking) {
      startMicRecording();
    } else if (!isRecording && isRecorderActive) {
      stopMicRecording();
    }
  }, [isRecording, isRecorderActive, isAISpeaking]);

  // Handle recording toggle
  const handleToggleRecording = useCallback(() => {
    if (isRecording) {
      stopMicRecording();
      wsStopRecording();
    } else {
      startMicRecording();
      wsStartRecording();
    }
  }, [isRecording, startMicRecording, stopMicRecording, wsStartRecording, wsStopRecording]);

  // Handle end interview
  const handleEndInterview = useCallback(() => {
    stopMicRecording();
    endInterview('completed');
  }, [stopMicRecording, endInterview]);

  // Loading state
  if (isStarting || isConnecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">
          {isStarting ? 'Starting interview...' : 'Connecting...'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-4">
          <ConnectionStatus isConnected={isConnected} />
          <h1 className="text-lg font-semibold">AI Interview</h1>
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
          <AlertDescription>{error || recorderError}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* AI Avatar Section */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <AIAvatar
            isSpeaking={isAISpeaking || isPlaying}
            isListening={isRecording}
            isProcessing={isProcessing}
          />
          
          <AudioVisualizer
            isActive={isRecording || isAISpeaking}
            volume={isRecording ? volume : 0}
            className="mt-8"
          />

          {/* Current Transcript */}
          {currentTranscript && (
            <div className="mt-4 p-4 bg-muted rounded-lg max-w-md">
              <p className="text-sm text-muted-foreground italic">
                "{currentTranscript}"
              </p>
            </div>
          )}
        </div>

        {/* Transcript Sidebar */}
        <div className="w-96 border-l">
          <TranscriptDisplay messages={messages} />
        </div>
      </div>

      {/* Controls */}
      <footer className="px-6 py-4 border-t">
        <InterviewControls
          isRecording={isRecording}
          isAISpeaking={isAISpeaking}
          isProcessing={isProcessing}
          onToggleRecording={handleToggleRecording}
          disabled={!isConnected || isAISpeaking}
        />
      </footer>
    </div>
  );
}