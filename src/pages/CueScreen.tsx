import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/sessionStore';

export default function CueScreen() {
  const navigate = useNavigate();
  const {
    selectedTopic, roughIdea, difficultySlider,
    cueQuestions, cueAnswers,
    setCueQuestions, setCueAnswers,
    recommendedWords,
  } = useStore();

  const [loading, setLoading] = useState(false);
  const [buildingTimeline, setBuildingTimeline] = useState(false);
  const [localAnswers, setLocalAnswers] = useState<string[]>(
    cueAnswers.length ? cueAnswers : []
  );

  // Fetch cue questions on mount if not already loaded
  useEffect(() => {
    if (!selectedTopic || !roughIdea) { navigate('/'); return; }
    if (cueQuestions.length > 0) {
      if (localAnswers.length === 0) setLocalAnswers(Array(cueQuestions.length).fill(''));
      return;
    }
    fetchCues();
  }, []);

  async function fetchCues() {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/cues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: selectedTopic, roughIdea }),
      });
      if (!res.ok) throw new Error('Failed to fetch cues');
      const data = await res.json();
      setCueQuestions(data.questions);
      setLocalAnswers(Array(data.questions.length).fill(''));
    } catch (err) {
      console.error(err);
      alert('Could not load planning questions. Please go back and try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleAnswerChange(idx: number, value: string) {
    setLocalAnswers(prev => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
  }

  // How many questions answered (at least a word or two)
  const answeredCount = localAnswers.filter(a => a.trim().length > 3).length;
  const canContinue = !loading && cueQuestions.length > 0 && answeredCount >= 2;

  async function handleContinue() {
    setCueAnswers(localAnswers);
    navigate('/select');
  }

  if (!selectedTopic) return null;

  return (
    <div className="min-h-screen bg-sand pb-36">
      <div className="max-w-xl mx-auto px-5 pt-8">

        {/* Back */}
        <button
          onClick={() => navigate('/')}
          className="text-xs font-mono text-ink-muted hover:text-ink mb-6 block"
        >
          ← Back to setup
        </button>

        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{selectedTopic.icon}</span>
            <h2 className="font-display text-3xl text-ink">Plan your talk</h2>
          </div>
          <p className="text-ink-muted text-sm mt-2 leading-relaxed">
            Answer in English — as much or as little as you like. The more detail you give, the better your speech plan will be.
          </p>
        </div>

        {/* Your idea recap */}
        <div className="bg-ink/5 border border-ink/8 rounded-xl p-4 mb-8 animate-slide-up"
          style={{ animationDelay: '40ms', animationFillMode: 'both' }}>
          <p className="text-xs font-mono text-ink-muted mb-1">Your idea</p>
          <p className="text-sm text-ink/80 italic leading-relaxed">"{roughIdea}"</p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col gap-4 animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-xl border border-stone bg-white/40 p-5"
                style={{ animationDelay: `${i * 60}ms` }}>
                <div className="h-3 bg-stone rounded w-3/4 mb-4" />
                <div className="h-16 bg-stone/50 rounded-lg" />
              </div>
            ))}
          </div>
        )}

        {/* Questions */}
        {!loading && cueQuestions.length > 0 && (
          <div className="flex flex-col gap-4">
            {cueQuestions.map((question, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-stone bg-white/70 p-5 animate-slide-up"
                style={{ animationDelay: `${60 + idx * 60}ms`, animationFillMode: 'both' }}
              >
                {/* Question number + text */}
                <div className="flex items-start gap-3 mb-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-ink flex items-center justify-center
                                   text-[10px] font-mono text-sand-50 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-sm font-medium text-ink leading-snug">{question}</p>
                </div>

                {/* Answer textarea */}
                <textarea
                  value={localAnswers[idx] || ''}
                  onChange={e => handleAnswerChange(idx, e.target.value)}
                  placeholder="Type your answer here…"
                  rows={3}
                  className="w-full rounded-lg border border-stone bg-sand/40 px-3 py-2.5
                             text-sm text-ink placeholder:text-ink-muted/40 resize-none
                             focus:outline-none focus:border-ink/40 focus:bg-white
                             transition-colors duration-150"
                />

                {/* Answered indicator */}
                {(localAnswers[idx] || '').trim().length > 3 && (
                  <p className="text-[10px] font-mono text-teal mt-1.5">✓ noted</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Skip hint */}
        {!loading && cueQuestions.length > 0 && (
          <p className="text-xs text-ink-muted text-center mt-6 animate-slide-up"
            style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
            You don't have to answer everything — skip any that don't apply.
          </p>
        )}
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-sand/95 backdrop-blur border-t border-stone px-5 py-4">
        <div className="max-w-xl mx-auto">
          {/* Progress hint */}
          {cueQuestions.length > 0 && (
            <p className="text-xs text-ink-muted text-center mb-3">
              {answeredCount === 0
                ? 'Answer at least 2 questions to continue'
                : answeredCount === 1
                ? 'One more answer to go'
                : `${answeredCount} of ${cueQuestions.length} answered — ready!`}
            </p>
          )}
          <button
            onClick={handleContinue}
            disabled={!canContinue || buildingTimeline}
            className="btn-primary w-full py-4 text-base"
          >
            {buildingTimeline ? 'Building…' : 'Choose my words →'}
          </button>
        </div>
      </div>
    </div>
  );
}
