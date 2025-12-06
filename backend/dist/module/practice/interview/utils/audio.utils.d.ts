/**
 * Convert Float32Array to PCM16 Buffer
 */
export declare function float32ToPCM16(float32Array: Float32Array): Buffer;
/**
 * Convert PCM16 Buffer to Float32Array
 */
export declare function pcm16ToFloat32(buffer: Buffer): Float32Array;
/**
 * Resample audio buffer
 */
export declare function resampleAudio(buffer: Buffer, fromRate: number, toRate: number): Buffer;
/**
 * Calculate audio duration in seconds
 */
export declare function calculateAudioDuration(bufferLength: number, sampleRate?: number, channels?: number, bitDepth?: number): number;
/**
 * Check if audio buffer contains speech (simple VAD)
 */
export declare function containsSpeech(buffer: Buffer, threshold?: number): boolean;
/**
 * Normalize audio buffer
 */
export declare function normalizeAudio(buffer: Buffer, targetLevel?: number): Buffer;
/**
 * Concatenate audio buffers
 */
export declare function concatenateAudioBuffers(buffers: Buffer[]): Buffer;
/**
 * Create WAV header for PCM audio
 */
export declare function createWavHeader(dataLength: number, sampleRate?: number, channels?: number, bitDepth?: number): Buffer;
/**
 * Convert PCM buffer to WAV buffer
 */
export declare function pcmToWav(pcmBuffer: Buffer, sampleRate?: number, channels?: number, bitDepth?: number): Buffer;
//# sourceMappingURL=audio.utils.d.ts.map