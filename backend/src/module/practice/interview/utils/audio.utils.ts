// src/module/practice/interview/utils/audio.utils.ts

import { AUDIO_CONFIG } from '../interview.constants';

/**
 * Convert Float32Array to PCM16 Buffer
 */
export function float32ToPCM16(float32Array: Float32Array): Buffer {
  const buffer = Buffer.alloc(float32Array.length * 2);

  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    const val = s < 0 ? s * 0x8000 : s * 0x7fff;
    buffer.writeInt16LE(Math.round(val), i * 2);
  }

  return buffer;
}

/**
 * Convert PCM16 Buffer to Float32Array
 */
export function pcm16ToFloat32(buffer: Buffer): Float32Array {
  const float32Array = new Float32Array(buffer.length / 2);

  for (let i = 0; i < float32Array.length; i++) {
    const val = buffer.readInt16LE(i * 2);
    float32Array[i] = val / (val < 0 ? 0x8000 : 0x7fff);
  }

  return float32Array;
}

/**
 * Resample audio buffer
 */
export function resampleAudio(
  buffer: Buffer,
  fromRate: number,
  toRate: number
): Buffer {
  if (fromRate === toRate) {
    return buffer;
  }

  const ratio = fromRate / toRate;
  const newLength = Math.round(buffer.length / ratio);
  const result = Buffer.alloc(newLength);

  for (let i = 0; i < newLength / 2; i++) {
    const srcIndex = Math.floor(i * ratio) * 2;
    if (srcIndex + 1 < buffer.length) {
      result.writeInt16LE(buffer.readInt16LE(srcIndex), i * 2);
    }
  }

  return result;
}

/**
 * Calculate audio duration in seconds
 */
export function calculateAudioDuration(
  bufferLength: number,
  sampleRate: number = AUDIO_CONFIG.SAMPLE_RATE,
  channels: number = AUDIO_CONFIG.CHANNELS,
  bitDepth: number = AUDIO_CONFIG.BIT_DEPTH
): number {
  const bytesPerSample = bitDepth / 8;
  const totalSamples = bufferLength / (bytesPerSample * channels);
  return totalSamples / sampleRate;
}

/**
 * Check if audio buffer contains speech (simple VAD)
 */
export function containsSpeech(
  buffer: Buffer,
  threshold: number = 0.02
): boolean {
  const float32 = pcm16ToFloat32(buffer);
  let sum = 0;

  for (let i = 0; i < float32.length; i++) {
    sum += Math.abs(float32[i]);
  }

  const average = sum / float32.length;
  return average > threshold;
}

/**
 * Normalize audio buffer
 */
export function normalizeAudio(buffer: Buffer, targetLevel: number = 0.8): Buffer {
  const float32 = pcm16ToFloat32(buffer);
  let max = 0;

  for (let i = 0; i < float32.length; i++) {
    max = Math.max(max, Math.abs(float32[i]));
  }

  if (max === 0) {
    return buffer;
  }

  const gain = targetLevel / max;
  const normalized = new Float32Array(float32.length);

  for (let i = 0; i < float32.length; i++) {
    normalized[i] = float32[i] * gain;
  }

  return float32ToPCM16(normalized);
}

/**
 * Concatenate audio buffers
 */
export function concatenateAudioBuffers(buffers: Buffer[]): Buffer {
  const totalLength = buffers.reduce((sum, buf) => sum + buf.length, 0);
  const result = Buffer.alloc(totalLength);

  let offset = 0;
  for (const buf of buffers) {
    buf.copy(result, offset);
    offset += buf.length;
  }

  return result;
}

/**
 * Create WAV header for PCM audio
 */
export function createWavHeader(
  dataLength: number,
  sampleRate: number = AUDIO_CONFIG.SAMPLE_RATE,
  channels: number = AUDIO_CONFIG.CHANNELS,
  bitDepth: number = AUDIO_CONFIG.BIT_DEPTH
): Buffer {
  const header = Buffer.alloc(44);
  const byteRate = (sampleRate * channels * bitDepth) / 8;
  const blockAlign = (channels * bitDepth) / 8;

  // RIFF header
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataLength, 4);
  header.write('WAVE', 8);

  // fmt subchunk
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  header.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitDepth, 34);

  // data subchunk
  header.write('data', 36);
  header.writeUInt32LE(dataLength, 40);

  return header;
}

/**
 * Convert PCM buffer to WAV buffer
 */
export function pcmToWav(
  pcmBuffer: Buffer,
  sampleRate: number = AUDIO_CONFIG.SAMPLE_RATE,
  channels: number = AUDIO_CONFIG.CHANNELS,
  bitDepth: number = AUDIO_CONFIG.BIT_DEPTH
): Buffer {
  const header = createWavHeader(pcmBuffer.length, sampleRate, channels, bitDepth);
  return Buffer.concat([header, pcmBuffer]);
}