import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/sessionStore';
import { useRecorder } from '../hooks/useRecorder';

function fmt(s: number) {
  return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
}

export default function RecordScreen() {
  const navigate = useNavigate();
  const { selectedTopic, roughIdea, selectedWords, selectedGrammar, setRecording } = useStore();
  const { status, audioBlob, audioUrl, error, start, stop, reset } = useRecorder();
  const [elapsed, setElapsed] = useState(0);
  const [showAllGrammar, setShowAllGrammar] = useState(false);

  useEffect(() => {
    if (status !== 'recording') return;
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  useEffect(() => {
    if (audioBlob) setRecording(audioBlob);
  }, [audioBlob]);

  if (!selectedTopic) { navigate('/'); return null; }

  const visibleGrammar = showAllGrammar ? selectedGrammar : selectedGrammar.slice(0, 3);

  return (
    <div className="min-h-screen bg-sand px-5 py-8 max-w-xl mx-auto flex flex-col">
      <button onClick={() => navigate('/select')} className="text-xs font-mono text-ink-muted hover:text-ink mb-6 self-start">
        ← Back
      </button>

      {/* Topic + idea */}
      <div className="bg-ink rounded-2xl p-6 mb-6 animate-slide-up">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">{selectedTopic.icon}</span>
          <p className="font-mono text-xs text-sand-200/60 uppercase tracking-widest">{selectedTopic.english}</p>
        </div>
        <p className="font-display text-xl text-sand-50 leading-relaxed">
          {roughIdea || `Speak freely about ${selectedTopic.english}.`}
        </p>
      </div>

      {/* Target words */}
      <div className="mb-4">
        <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-2">Try to use these words</p>
        <div className="flex flex-wrap gap-2">
          {selectedWords.map(w => (
            <span key={w.id} className="px-3 py-1.5 bg-white border border-stone rounded-full text-sm font-display text-ink">
              {w.korean}
            </span>
          ))}
        </div>
      </div>

      {/* Grammar */}
      {selectedGrammar.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-2">Grammar patterns</p>
          <div className="flex flex-wrap gap-2">
            {visibleGrammar.map(g => (
              <span key={g.id} className="chip border-teal/30 text-teal bg-teal/5">{g.korean}</span>
            ))}
          </div>
          {selectedGrammar.length > 3 && (
            <button onClick={() => setShowAllGrammar(v => !v)}
              className="text-xs font-mono text-ink-muted hover:text-ink mt-2">
              {showAllGrammar ? 'Show less ↑' : `+ ${selectedGrammar.length - 3} more`}
            </button>
          )}
        </div>
      )}

      {/* Recorder */}
      <div className="flex-1 flex flex-col items-center justify-center gap-5 py-6">
        {error && <p className="text-sm text-coral text-center">{error}</p>}

        <p className="font-mono text-5xl text-ink/20 tabular-nums">{fmt(elapsed)}</p>

        {status === 'idle' && (
          <button onClick={start}
            className="w-20 h-20 rounded-full bg-ink flex items-center justify-center text-2xl
                       hover:bg-coral transition-colors duration-200 shadow-lg active:scale-95">
            🎙️
          </button>
        )}

        {status === 'recording' && (
          <button onClick={stop}
            className="w-20 h-20 rounded-full bg-coral flex items-center justify-center text-2xl
                       shadow-lg animate-pulse hover:animate-none active:scale-95 transition-all">
            ⏹
          </button>
        )}

        {status === 'stopped' && audioUrl && (
          <div className="w-full flex flex-col gap-4 items-center animate-slide-up">
            <audio controls src={audioUrl} className="w-full rounded-xl" />
            <div className="flex gap-3">
              <button onClick={() => { reset(); setElapsed(0); }} className="btn-outline text-sm">
                Re-record
              </button>
              <button onClick={() => navigate('/evaluate')} className="btn-primary text-sm">
                Review →
              </button>
            </div>
          </div>
        )}

        <p className="text-xs text-ink-muted text-center max-w-xs">
          {status === 'idle' && 'Press the mic. Speak naturally for about 2 minutes.'}
          {status === 'recording' && 'Recording… press stop when you\'re done.'}
          {status === 'stopped' && 'Listen back, then mark the words you used.'}
        </p>
      </div>
    </div>
  );
}
