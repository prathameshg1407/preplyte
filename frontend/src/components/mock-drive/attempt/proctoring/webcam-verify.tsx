// src/components/mock-drive/attempt/proctoring/webcam-verify.tsx

'use client';

import { FC, useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface WebcamVerifyProps {
  onVerified: (stream: MediaStream) => void;
  requireFullscreen?: boolean;
}

export const WebcamVerify: FC<WebcamVerifyProps> = ({ onVerified, requireFullscreen }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<'IDLE' | 'REQUESTING' | 'VERIFIED' | 'ERROR'>('IDLE');
  const [error, setError] = useState<string | null>(null);

  const requestPermission = async () => {
    setStatus('REQUESTING');
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStatus('VERIFIED');
      toast.success('Webcam verified successfully');
    } catch (err: any) {
      console.error('Webcam permission error:', err);
      setStatus('ERROR');
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please enable camera permissions in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on your device.');
      } else {
        setError('Could not access camera. Please ensure no other app is using it.');
      }
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleStart = async () => {
    if (stream) {
      if (requireFullscreen) {
        try {
          if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
          }
        } catch (error) {
          console.error('Fullscreen request failed:', error);
        }
      }
      onVerified(stream);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md shadow-2xl border-primary/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Camera className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Webcam Verification</CardTitle>
          <CardDescription>
            This mock drive requires an active webcam for proctoring. 
            Please ensure your face is clearly visible.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative aspect-video overflow-hidden rounded-lg border-2 border-muted bg-muted flex items-center justify-center">
            {status === 'VERIFIED' && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />
            )}
            
            {status === 'IDLE' && (
              <div className="text-center p-4">
                <CameraOff className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Camera is off</p>
              </div>
            )}

            {status === 'REQUESTING' && (
              <div className="text-center">
                <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Requesting access...</p>
              </div>
            )}

            {status === 'ERROR' && (
              <div className="text-center p-6 text-destructive">
                <AlertCircle className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {status === 'VERIFIED' && (
              <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-1 text-[10px] font-bold text-green-600 border border-green-500/50 backdrop-blur-sm">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                LIVE
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded border border-border">
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              <span>Ensure you are in a well-lit environment</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded border border-border">
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              <span>Do not wear sunglasses or hats</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          {status !== 'VERIFIED' ? (
            <Button onClick={requestPermission} className="w-full" disabled={status === 'REQUESTING'}>
              {status === 'REQUESTING' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please Allow Access
                </>
              ) : (
                'Enable Camera'
              )}
            </Button>
          ) : (
            <Button onClick={handleStart} className="w-full bg-green-600 hover:bg-green-700 text-white">
              Proceed to Test
            </Button>
          )}
          {status === 'ERROR' && (
            <Button variant="ghost" onClick={requestPermission} className="text-xs">
              Try Again
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};
