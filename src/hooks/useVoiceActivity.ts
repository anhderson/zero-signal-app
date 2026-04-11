import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../store';

const VAD_THRESHOLD   = 12;   // RMS threshold (0-255) to consider "speaking"
const VAD_INTERVAL_MS = 80;   // how often we sample (ms)
const SILENCE_DELAY   = 400;  // ms of silence before clearing "speaking"

/**
 * useVoiceActivity — Web Audio API VAD (Voice Activity Detection).
 *
 * When `active` is true:
 *   - Requests microphone access
 *   - Checks RMS amplitude every VAD_INTERVAL_MS ms
 *   - Calls setSpeaking(userId, true/false) on the global store
 *
 * When `active` is false or `muted` is true, cleans up everything.
 */
export function useVoiceActivity(userId: string, active: boolean, muted: boolean) {
  const setSpeaking = useAppStore(s => s.setSpeaking);

  const streamRef   = useRef<MediaStream | null>(null);
  const ctxRef      = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSpeakingRef = useRef(false);

  const stopAll = useCallback(() => {
    if (timerRef.current)   clearInterval(timerRef.current);
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    timerRef.current = null;
    silenceTimer.current = null;

    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;

    ctxRef.current?.close().catch(() => {});
    ctxRef.current = null;
    analyserRef.current = null;

    if (isSpeakingRef.current) {
      isSpeakingRef.current = false;
      setSpeaking(userId, false);
    }
  }, [userId, setSpeaking]);

  useEffect(() => {
    if (!active || muted) {
      stopAll();
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }

        streamRef.current = stream;

        const ctx  = new AudioContext();
        ctxRef.current = ctx;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        analyserRef.current = analyser;

        const src = ctx.createMediaStreamSource(stream);
        src.connect(analyser);

        const data = new Uint8Array(analyser.frequencyBinCount);

        timerRef.current = setInterval(() => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteTimeDomainData(data);

          // Calculate RMS
          let sum = 0;
          for (let i = 0; i < data.length; i++) {
            const v = (data[i] - 128);
            sum += v * v;
          }
          const rms = Math.sqrt(sum / data.length);

          if (rms > VAD_THRESHOLD) {
            // Clear any pending silence timeout
            if (silenceTimer.current) { clearTimeout(silenceTimer.current); silenceTimer.current = null; }
            if (!isSpeakingRef.current) {
              isSpeakingRef.current = true;
              setSpeaking(userId, true);
            }
          } else {
            if (isSpeakingRef.current && !silenceTimer.current) {
              // Debounce silence: wait SILENCE_DELAY before clearing
              silenceTimer.current = setTimeout(() => {
                isSpeakingRef.current = false;
                setSpeaking(userId, false);
                silenceTimer.current = null;
              }, SILENCE_DELAY);
            }
          }
        }, VAD_INTERVAL_MS);

      } catch (err) {
        console.warn('[VAD] Microphone access denied or error:', err);
      }
    })();

    return () => {
      cancelled = true;
      stopAll();
    };
  }, [active, muted, userId, setSpeaking, stopAll]);
}
