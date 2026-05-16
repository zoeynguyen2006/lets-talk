import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/sessionStore';

export default function FeedbackScreen() {
  const navigate = useNavigate();
  const {
    selectedTopic, selectedWords, grammarPatterns,
    usedWordIds, usedGrammarIds, feedback, reset,
  } = useStore();

  if (!feedback || !selectedTopic) { navigate('/'); return null; }

  const usedWords   = selectedWords.filter(w =>  usedWordIds.includes(w.id));
  const usedGrammar = grammarPatterns.filter(g => usedGrammarIds.includes(g.id));

  return (
    <div className="min-h-screen bg-sand px-5 py-8 max-w-xl mx-auto">

      {/* Header */}
      <div className="mb-8 animate-slide-up">
        <p className="text-xs font-mono text-ink-muted uppercase tracking-widest mb-2">Session complete</p>
        <h2 className="font-display text-4xl text-ink">Feedback</h2>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-2 gap-3 mb-8 animate-slide-up"
        style={{ animationDelay: '60ms', animationFillMode: 'both' }}>
        <div className="bg-teal/10 border border-teal/20 rounded-xl p-4 text-center">
          <p className="font-mono text-3xl text-teal font-bold">{usedWordIds.length}</p>
          <p className="text-xs text-teal/70 mt-1">Words used</p>
        </div>
        <div className="bg-coral/10 border border-coral/20 rounded-xl p-4 text-center">
          <p className="font-mono text-3xl text-coral font-bold">{feedback.missedWords.length}</p>
          <p className="text-xs text-coral/70 mt-1">To practice</p>
        </div>
      </div>

      {/* Coach message */}
      <div className="bg-ink rounded-2xl p-6 mb-8 animate-slide-up"
        style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
        <p className="text-xs font-mono text-sand-200/50 uppercase tracking-widest mb-3">Coach says</p>
        <p className="text-sand-50 leading-relaxed">{feedback.encouragement}</p>
        {feedback.usedSummary && (
          <p className="text-sand-200/60 text-sm mt-3 leading-relaxed">{feedback.usedSummary}</p>
        )}
      </div>

      {/* Used words */}
      {usedWords.length > 0 && (
        <section className="mb-8 animate-slide-up"
          style={{ animationDelay: '140ms', animationFillMode: 'both' }}>
          <p className="text-xs font-mono uppercase tracking-widest text-teal mb-3">✓ Successfully used</p>
          <div className="flex flex-wrap gap-2">
            {usedWords.map(w => (
              <div key={w.id} className="px-3 py-2 rounded-xl bg-teal/10 border border-teal/20">
                <p className="font-display text-sm text-teal">{w.korean}</p>
                <p className="text-[10px] text-teal/60">{w.english}</p>
              </div>
            ))}
          </div>
          {usedGrammar.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {usedGrammar.map(g => (
                <span key={g.id}
                  className="px-3 py-1.5 rounded-lg border border-teal/30 text-teal text-xs font-mono bg-teal/5">
                  {g.pattern}
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Missed words */}
      {feedback.missedWords.length > 0 && (
        <section className="mb-8 animate-slide-up"
          style={{ animationDelay: '180ms', animationFillMode: 'both' }}>
          <p className="text-xs font-mono uppercase tracking-widest text-coral mb-3">Practice next time</p>
          <div className="flex flex-col gap-3">
            {feedback.missedWords.map(item => (
              <div key={item.id} className="bg-white border border-stone rounded-xl p-4">
                <div className="flex items-baseline gap-2 mb-2">
                  <p className="font-display text-xl text-ink">{item.korean}</p>
                  <p className="text-xs text-ink-muted">{item.english}</p>
                </div>
                <p className="text-xs text-ink-muted leading-relaxed mb-2">{item.reason}</p>
                <div className="bg-sand rounded-lg p-3">
                  <p className="text-xs font-mono text-ink-muted mb-1">Try using it like:</p>
                  <p className="text-sm italic text-ink/80">{item.example}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Missed grammar */}
      {feedback.missedGrammar.length > 0 && (
        <section className="mb-8 animate-slide-up"
          style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
          <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-3">Grammar to revisit</p>
          <div className="flex flex-col gap-3">
            {feedback.missedGrammar.map(item => (
              <div key={item.id} className="bg-white border border-stone rounded-xl p-4">
                <p className="font-mono text-sm text-ink font-medium mb-1">{item.pattern}</p>
                <p className="text-xs text-ink-muted mb-2">{item.meaning}</p>
                <p className="text-xs text-ink-muted leading-relaxed mb-2">{item.reason}</p>
                <p className="text-xs italic text-ink/60 bg-sand rounded-lg px-3 py-2">{item.example}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Next session sentence */}
      <div className="bg-stone/50 border border-stone rounded-xl p-5 mb-10 animate-slide-up"
        style={{ animationDelay: '220ms', animationFillMode: 'both' }}>
        <p className="text-xs font-mono text-ink-muted uppercase tracking-widest mb-2">For next time</p>
        <p className="text-sm text-ink leading-relaxed">{feedback.nextSentence}</p>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 animate-slide-up"
        style={{ animationDelay: '260ms', animationFillMode: 'both' }}>
        <button onClick={() => navigate('/record')} className="btn-outline flex-1">
          Try Again
        </button>
        <button onClick={() => { reset(); navigate('/'); }} className="btn-primary flex-1">
          New Practice
        </button>
      </div>
    </div>
  );
}
