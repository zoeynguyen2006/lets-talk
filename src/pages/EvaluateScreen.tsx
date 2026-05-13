import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/sessionStore';

export default function EvaluateScreen() {
  const navigate = useNavigate();
  const {
    selectedTopic, recordingBlob, selectedWords, selectedGrammar,
    usedWordIds, usedGrammarIds, toggleUsedWord, toggleUsedGrammar, setFeedback
  } = useStore();

  const audioUrl = recordingBlob ? URL.createObjectURL(recordingBlob) : null;
  if (!audioUrl || !selectedTopic) { navigate("/record"); return null; }


  async function handleGetFeedback() {
    if (!selectedTopic) return;
  
    const missedWords = selectedWords.filter(
      (word) => !usedWordIds.includes(word.id)
    );
  
    const usedWords = selectedWords.filter(
      (word) => usedWordIds.includes(word.id)
    );
  
    const missedGrammar = selectedGrammar.filter(
      (grammar) => !usedGrammarIds.includes(grammar.id)
    );
  
    const usedGrammar = selectedGrammar.filter(
      (grammar) => usedGrammarIds.includes(grammar.id)
    );
  
    try {
      const response = await fetch("http://localhost:3001/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: selectedTopic,
          selectedWords,
          usedWords,
          missedWords,
          selectedGrammar,
          usedGrammar,
          missedGrammar,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to generate feedback.");
      }
  
      const data = await response.json();
  
      setFeedback(data.feedback);
      navigate("/feedback");
    } catch (error) {
      console.error("Feedback generation error:", error);
      alert("Could not generate feedback right now. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-sand pb-32">
      <div className="max-w-xl mx-auto px-5 pt-8">
        <button onClick={() => navigate('/record')} className="text-xs font-mono text-ink-muted hover:text-ink mb-6 block">
          ← Re-record
        </button>

        <h2 className="font-display text-3xl text-ink mb-1 animate-slide-up">Self-check</h2>
        <p className="text-ink-muted text-sm mb-6 animate-slide-up" style={{animationDelay:'40ms',animationFillMode:'both'}}>
          Listen to your recording. Tap each word or pattern you hear yourself say.
        </p>

        {/* Player */}
        <div className="bg-ink rounded-2xl p-5 mb-8 animate-slide-up" style={{animationDelay:'80ms',animationFillMode:'both'}}>
          <p className="text-xs font-mono text-sand-200/50 uppercase tracking-widest mb-3">Your recording</p>
          <audio controls src={audioUrl} className="w-full" />
        </div>

        {/* Counter */}
        <div className="flex gap-3 mb-6 animate-slide-up" style={{animationDelay:'100ms',animationFillMode:'both'}}>
          <div className="flex-1 bg-white border border-stone rounded-xl p-3 text-center">
            <p className="font-mono text-2xl text-teal font-bold">{usedWordIds.length}<span className="text-ink-muted text-base">/{selectedWords.length}</span></p>
            <p className="text-xs text-ink-muted mt-0.5">Words used</p>
          </div>
          {selectedGrammar.length > 0 && (
            <div className="flex-1 bg-white border border-stone rounded-xl p-3 text-center">
              <p className="font-mono text-2xl text-teal font-bold">{usedGrammarIds.length}<span className="text-ink-muted text-base">/{selectedGrammar.length}</span></p>
              <p className="text-xs text-ink-muted mt-0.5">Grammar used</p>
            </div>
          )}
        </div>

        {/* Word tiles */}
        <section className="mb-6">
          <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-3">Mark the words you used</p>
          <div className="flex flex-wrap gap-2">
            {selectedWords.map(word => {
              const used = usedWordIds.includes(word.id);
              return (
                <button key={word.id} onClick={() => toggleUsedWord(word.id)}
                  className={`px-4 py-2.5 rounded-xl border transition-all duration-150 text-sm font-display
                    ${used
                      ? 'bg-teal text-white border-teal shadow-sm animate-pop'
                      : 'bg-white border-stone text-ink hover:border-teal/40'}`}>
                  {used && <span className="mr-1 text-xs">✓</span>}{word.korean}
                </button>
              );
            })}
          </div>
        </section>

        {/* Grammar tiles */}
        {selectedGrammar.length > 0 && (
          <section className="mb-8">
            <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-3">Mark grammar patterns used</p>
            <div className="flex flex-wrap gap-2">
              {selectedGrammar.map(g => {
                const used = usedGrammarIds.includes(g.id);
                return (
                  <button key={g.id} onClick={() => toggleUsedGrammar(g.id)}
                    className={`chip transition-all duration-150 font-mono
                      ${used
                        ? 'bg-teal text-white border-teal animate-pop'
                        : 'border-stone text-ink-muted hover:border-teal/40'}`}>
                    {used && '✓ '}{g.korean}
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
