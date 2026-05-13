import { useState, useRef, useCallback } from 'react';

type Status = 'idle' | 'recording' | 'stopped';

export function useRecorder() {
  const [status, setStatus] = useState<Status>('idle');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const start = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      recRef.current = rec;
      chunks.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunks.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob); setAudioUrl(url); setStatus('stopped');
        stream.getTracks().forEach(t => t.stop());
      };
      rec.start();
      setStatus('recording');
    } catch {
      setError('Microphone access denied. Please allow mic permission.');
    }
  }, []);

  const stop = useCallback(() => {
    if (recRef.current && status === 'recording') recRef.current.stop();
  }, [status]);

  const reset = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null); setAudioUrl(null); setStatus('idle'); setError(null);
  }, [audioUrl]);

  return { status, audioBlob, audioUrl, error, start, stop, reset };
}
