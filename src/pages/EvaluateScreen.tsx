import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/sessionStore';

export default function EvaluateScreen() {
  const navigate = useNavigate();
  const {
    selectedTopic, recordingBlob,
    selectedWords, grammarPatterns,
    usedWordIds, usedGrammarIds,
    toggleUsedWord, toggleUsedGrammar,
    setFeedback, roughIdea,
  } = useStore();

  const audioUrl = recordingBlob ? URL.createObjectURL(recordingBlob) : null;
  if (!audioUrl || !selectedTopic) { navigate('/record'); return null; }

  async function handleGetFeedback() {
    if (!selectedTopic) return;

    const missedWords = selectedWords.filter(w => !usedWordIds.includes(w.id));
    const usedWords   = selectedWords.filter(w =>  usedWordIds.includes(w.id));

    try {
      const response = await fetch('http://localhost:3001/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: selectedTopic,
          roughIdea,
          selectedWords,
          usedWords,
          missedWords,
          grammarPatterns,
          usedGrammarIds,
          missedGrammarIds: grammarPatterns
            .filter(g => !usedGrammarIds.includes(g.id))
            .map(g => g.id),
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.error || 'Failed to generate feedback.');
      }

      const data = await response.json();
      setFeedback(data.feedback);
      navigate('/feedback');
    } catch (error) {
      console.error('Feedback error:', error);
      alert('Could not generate feedback right now. Please try again.');
    }
  }

  return (
    <div className="min-h-screen bg-sand pb-32">
      <div className="max-w-xl mx-auto px-5 pt-8">
        <button onClick={() => navigate('/record')}
          className="text-xs font-mono text-ink-muted hover:text-ink mb-6 block">
          ← Re-record
        </button>

        <h2 className="font-display text-3xl text-ink mb-1 animate-slide-up">Self-check</h2>
        <p className="text-ink-muted text-sm mb-6 animate-slide-up"
          style={{ animationDelay: '40ms', animationFillMode: 'both' }}>
          Listen to your recording. Tap each word or grammar pattern you hear yourself use.
        </p>

        {/* Player */}
        <div className="bg-ink rounded-2xl p-5 mb-8 animate-slide-up"
          style={{ animationDelay: '80ms', animationFillMode: 'both' }}>
          <p className="text-xs font-mono text-sand-200/50 uppercase tracking-widest mb-3">
            Your recording
          </p>
          <audio controls src={audioUrl} className="w-full" />
        </div>

        {/* Counters */}
        <div className="flex gap-3 mb-6 animate-slide-up"
          style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
          <div className="flex-1 bg-white border border-stone rounded-xl p-3 text-center">
            <p className="font-mono text-2xl text-teal font-bold">
              {usedWordIds.length}
              <span className="text-ink-muted text-base">/{selectedWords.length}</span>
            </p>
            <p className="text-xs text-ink-muted mt-0.5">Words used</p>
          </div>
          {grammarPatterns.length > 0 && (
            <div className="flex-1 bg-white border border-stone rounded-xl p-3 text-center">
              <p className="font-mono text-2xl text-teal font-bold">
                {usedGrammarIds.length}
                <span className="text-ink-muted text-base">/{grammarPatterns.length}</span>
              </p>
              <p className="text-xs text-ink-muted mt-0.5">Grammar used</p>
            </div>
          )}
        </div>

        {/* Word tiles */}
        <section className="mb-6">
          <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-3">
            Mark the words you used
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedWords.map(word => {
              const used = usedWordIds.includes(word.id);
              return (
                <button key={word.id} onClick={() => toggleUsedWord(word.id)}
                  className={`px-4 py-2.5 rounded-xl border transition-all duration-150 text-sm font-display
                    ${used
                      ? 'bg-teal text-white border-teal shadow-sm animate-pop'
                      : 'bg-white border-stone text-ink hover:border-teal/40'}`}>
                  {used && <span className="mr-1 text-xs">✓</span>}
                  {word.korean}
                </button>
              );
            })}
          </div>
        </section>

        {/* Grammar tiles */}
        {grammarPatterns.length > 0 && (
          <section className="mb-8">
            <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-3">
              Mark grammar patterns used
            </p>
            <div className="flex flex-col gap-2">
              {grammarPatterns.map(g => {
                const used = usedGrammarIds.includes(g.id);
                return (
                  <button key={g.id} onClick={() => toggleUsedGrammar(g.id)}
                    className={`text-left px-4 py-3 rounded-xl border transition-all duration-150
                      ${used
                        ? 'bg-teal text-white border-teal animate-pop'
                        : 'bg-white border-stone text-ink hover:border-teal/40'}`}>
                    <p className={`font-mono text-sm font-medium ${used ? 'text-white' : 'text-ink'}`}>
                      {used && '✓ '}{g.pattern}
                    </p>
                    <p className={`text-xs mt-0.5 ${used ? 'text-white/70' : 'text-ink-muted'}`}>
                      {g.meaning}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-sand/95 backdrop-blur border-t border-stone px-5 py-4">
        <div className="max-w-xl mx-auto">
          <button onClick={handleGetFeedback} className="btn-primary w-full py-4 text-base">
            Get Feedback →
          </button>
        </div>
      </div>
    </div>
  );
}
