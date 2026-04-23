// src/components/mock-drive/attempt/proctoring/webcam-monitor.tsx

'use client';

import { FC, useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, AlertCircle } from 'lucide-react';

interface WebcamMonitorProps {
  stream: MediaStream | null;
}

export const WebcamMonitor: FC<WebcamMonitorProps> = ({ stream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      setIsActive(true);
      
      const track = stream.getVideoTracks()[0];
      if (track) {
        track.onended = () => setIsActive(false);
      }
    } else {
      setIsActive(false);
    }
  }, [stream]);

  if (isMinimized) {
    return (
      <button 
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all scale-100 active:scale-95"
      >
        <Camera className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-40 overflow-hidden rounded-lg border-2 border-primary/20 bg-muted shadow-2xl transition-all hover:border-primary/40 group">
      <div className="relative aspect-video bg-black">
        {isActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover mirror"
            style={{ transform: 'scaleX(-1)' }} // Mirror the feed
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-destructive">
            <CameraOff className="h-6 w-6 mb-1" />
            <span className="text-[10px] font-medium">CAM OFF</span>
          </div>
        )}

        <div className="absolute top-1 left-1 flex items-center gap-1 rounded bg-black/60 px-1 py-0.5 text-[8px] font-bold text-white backdrop-blur-sm">
          <div className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          PROCTORING
        </div>

        <button 
          onClick={() => setIsMinimized(true)}
          className="absolute top-1 right-1 hidden h-4 w-4 items-center justify-center rounded bg-black/60 text-white hover:bg-black/80 group-hover:flex"
        >
          <span className="text-[10px]">−</span>
        </button>
      </div>
      
      {!isActive && (
        <div className="flex items-center gap-1.5 bg-destructive/10 p-1.5 text-destructive dark:bg-destructive/20">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span className="text-[8px] font-semibold leading-tight">
            Webcam disconnected! Please reconnect immediately.
          </span>
        </div>
      )}
    </div>
  );
};
