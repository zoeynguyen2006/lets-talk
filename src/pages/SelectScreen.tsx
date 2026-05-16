import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/sessionStore';
import type { Word } from '../types';

const DIFF_LABEL: Record<string, string> = {
  lower_beginner: 'Beginner',
  upper_beginner: 'Upper Beg.',
  intermediate:   'Intermediate',
};
const DIFF_COLOR: Record<string, string> = {
  lower_beginner: 'border-teal/30 text-teal',
  upper_beginner: 'border-ink-muted/30 text-ink-muted',
  intermediate:   'border-coral/30 text-coral',
};

export default function SelectScreen() {
  const navigate = useNavigate();
  const {
    selectedTopic, roughIdea, difficultySlider,
    recommendedWords, selectedWords,
    cueQuestions, cueAnswers,
    toggleWord, setRecommendedWords, setTimeline,
  } = useStore();

  const [flippedWordIds, setFlippedWordIds] = useState<string[]>([]);
  const [buildingTimeline, setBuildingTimeline] = useState(false);
  // Words are loaded here for the first time (after cue answers exist)
  const [loadingWords, setLoadingWords] = useState(false);
  const [wordsLoaded, setWordsLoaded] = useState(recommendedWords.length > 0);

  if (!selectedTopic) { navigate('/'); return null; }

  // Load words on first visit (now that we have cueAnswers)
  if (!wordsLoaded && !loadingWords) {
    setLoadingWords(true);
    fetch('http://localhost:3001/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: selectedTopic,
        roughIdea,
        cueAnswers,
        difficultySliderValue: difficultySlider,
      }),
    })
      .then(r => r.json())
      .then(data => {
        setRecommendedWords(data.words);
        setWordsLoaded(true);
      })
      .catch(() => alert('Could not load words. Please go back and try again.'))
      .finally(() => setLoadingWords(false));
  }

  function toggleWordFlip(id: string) {
    setFlippedWordIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  const MAX_WORDS = 10;
  const wordCount = selectedWords.length;
  const canContinue = wordCount >= 5 && !loadingWords;
  const atMax = wordCount >= MAX_WORDS;

  async function handleContinue() {
    if (!canContinue || buildingTimeline) return;
    setBuildingTimeline(true);
    try {
      const res = await fetch('http://localhost:3001/api/timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: selectedTopic,
          roughIdea,
          selectedWords,
          cueQuestions,
          cueAnswers,
          difficultySliderValue: difficultySlider,
        }),
      });
      if (!res.ok) throw new Error('Failed to build timeline');
      const data = await res.json();
      setTimeline(data.timeline, data.grammar);
      navigate('/timeline');
    } catch (err) {
      console.error(err);
      alert('Could not build your speech plan. Please try again.');
    } finally {
      setBuildingTimeline(false);
    }
  }

  return (
    <div className="min-h-screen bg-sand pb-32">
      <div className="max-w-xl mx-auto px-5 pt-8">

        {/* Header */}
        <div className="mb-6 animate-slide-up">
          <button onClick={() => navigate('/cues')}
            className="text-xs font-mono text-ink-muted hover:text-ink mb-4 block">
            ← Back to questions
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{selectedTopic.icon}</span>
            <h2 className="font-display text-2xl text-ink">Pick your words</h2>
          </div>
          <p className="text-xs text-ink-muted mt-1 leading-relaxed">
            Choose 5–10 words you want to actively use. Tap a card to see an example, then hit Select.
          </p>
          {roughIdea && (
            <div className="bg-ink/5 border border-ink/8 rounded-xl p-3 mt-3">
              <p className="text-xs font-mono text-ink-muted mb-1">Your idea</p>
              <p className="text-sm text-ink/80 italic leading-relaxed">"{roughIdea}"</p>
            </div>
          )}
        </div>

        {/* ── Vocabulary ── */}
        <section className="mb-8">
          <div className="flex items-baseline justify-between mb-3">
            <p className="text-xs font-mono uppercase tracking-widest text-ink-muted">Vocabulary</p>
            <p className={`text-xs font-mono ${atMax ? 'text-coral' : 'text-ink-muted'}`}>
              {wordCount} / {MAX_WORDS} selected
            </p>
          </div>

          {/* Loading skeleton */}
          {loadingWords && (
            <div className="grid grid-cols-2 gap-2 animate-pulse">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="min-h-[150px] rounded-xl border border-stone bg-white/40" />
              ))}
            </div>
          )}

          {!loadingWords && (
            <div className="grid grid-cols-2 gap-2">
              {recommendedWords.map((word: Word) => {
                const sel = selectedWords.some(w => w.id === word.id);
                const disabled = !sel && atMax;
                const flipped = flippedWordIds.includes(word.id);

                return (
                  <div
                    key={word.id}
                    onClick={() => toggleWordFlip(word.id)}
                    className={`
                      relative min-h-[150px] rounded-xl border cursor-pointer overflow-hidden
                      transition-all duration-200
                      ${sel
                        ? 'border-ink bg-ink text-sand-50 shadow-md animate-pop'
                        : disabled
                          ? 'border-stone/50 bg-stone/20 opacity-40'
                          : 'border-stone bg-white/60 hover:border-ink/40 hover:bg-white/90'}
                    `}
                  >
                    {!flipped ? (
                      <div className="h-full p-4 flex flex-col">
                        <div className="flex-1">
                          <p className={`font-display text-xl mb-1 ${sel ? 'text-sand-50' : 'text-ink'}`}>
                            {word.korean}
                          </p>
                          <p className={`text-xs leading-tight mb-2 ${sel ? 'text-sand-200' : 'text-ink-muted'}`}>
                            {word.english}
                          </p>
                          <span className={`chip text-[10px] ${sel
                            ? 'border-sand/20 text-sand-200'
                            : DIFF_COLOR[word.difficulty]}`}>
                            {DIFF_LABEL[word.difficulty]}
                          </span>
                        </div>
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={e => {
                            e.stopPropagation();
                            if (!disabled) toggleWord(word);
                          }}
                          className={`
                            mt-4 w-full rounded-lg px-3 py-2 text-xs font-mono transition-colors
                            ${sel
                              ? 'bg-sand-50 text-ink hover:bg-sand-100'
                              : disabled
                                ? 'bg-stone/40 text-ink-muted cursor-not-allowed'
                                : 'bg-ink text-sand-50 hover:bg-ink/90'}
                          `}
                        >
                          {sel ? 'Selected ✓' : 'Select'}
                        </button>
                      </div>
                    ) : (
                      <div className={`h-full p-4 flex flex-col justify-between
                        ${sel ? 'bg-ink text-sand-50' : 'bg-white/80 text-ink'}`}>
                        <div>
                          <p className={`text-[10px] font-mono uppercase tracking-widest mb-2
                            ${sel ? 'text-sand-200/70' : 'text-ink-muted'}`}>
                            Example
                          </p>
                          <p className={`text-sm leading-relaxed ${sel ? 'text-sand-50' : 'text-ink'}`}>
                            {word.example || 'No example yet.'}
                          </p>
                        </div>
                        <p className={`text-[10px] font-mono mt-4 ${sel ? 'text-sand-200/60' : 'text-ink-muted'}`}>
                          Tap to flip back
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-sand/95 backdrop-blur border-t border-stone px-5 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-ink">
              <span className="font-semibold">{wordCount}</span> words selected
            </p>
            {loadingWords && <p className="text-xs text-ink-muted mt-0.5">Loading words…</p>}
            {!loadingWords && !canContinue && (
              <p className="text-xs text-coral mt-0.5">Select at least 5 words</p>
            )}
            {buildingTimeline && (
              <p className="text-xs text-teal mt-0.5">Building your speech plan…</p>
            )}
          </div>
          <button
            onClick={handleContinue}
            disabled={!canContinue || buildingTimeline}
            className="btn-primary whitespace-nowrap"
          >
            {buildingTimeline ? 'Building…' : 'Build my plan →'}
          </button>
        </div>
      </div>
    </div>
  );
}

