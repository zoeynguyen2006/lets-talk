import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/sessionStore';
import { GRAMMAR } from '../data/grammar';
import type { Word, Grammar } from '../types';

const DIFF_LABEL: Record<string,string> = {
  lower_beginner: 'Beginner',
  upper_beginner: 'Upper Beg.',
  intermediate:   'Intermediate',
};
const DIFF_COLOR: Record<string,string> = {
  lower_beginner: 'border-teal/30 text-teal',
  upper_beginner: 'border-ink-muted/30 text-ink-muted',
  intermediate:   'border-coral/30 text-coral',
};

export default function SelectScreen() {
  const navigate = useNavigate();
  const { selectedTopic, roughIdea, recommendedWords, selectedWords, selectedGrammar,
          toggleWord, toggleGrammar } = useStore();
  const [grammarFilter, setGrammarFilter] = useState<'all'|'beginner'|'intermediate'>('all');
  const [flippedWordIds, setFlippedWordIds] = useState<string[]>([]);

  function toggleWordFlip(id: string) {
    setFlippedWordIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }
  if (!selectedTopic) { navigate('/'); return null; }

  const MAX_WORDS = 10;
  const wordCount = selectedWords.length;
  const canStart = wordCount >= 5;
  const atMax = wordCount >= MAX_WORDS;

  const filteredGrammar = GRAMMAR.filter(g => {
    if (grammarFilter === 'all') return true;
    if (grammarFilter === 'beginner') return !g.example.includes('정도') && g.id <= 'g015';
    return g.id > 'g015';
  });

  return (
    <div className="min-h-screen bg-sand pb-32">
      <div className="max-w-xl mx-auto px-5 pt-8">

        {/* Header */}
        <div className="mb-6 animate-slide-up">
          <button onClick={() => navigate('/')} className="text-xs font-mono text-ink-muted hover:text-ink mb-4 block">
            ← Back to setup
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{selectedTopic.icon}</span>
            <h2 className="font-display text-2xl text-ink">{selectedTopic.korean}</h2>
          </div>
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
          <p className="text-xs text-ink-muted mb-4">Choose 6–8 words you want to try using. Max 10.</p>

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

              <span className={`chip text-[10px] ${sel ? 'border-sand/20 text-sand-200' : DIFF_COLOR[word.difficulty]}`}>
                {DIFF_LABEL[word.difficulty]}
              </span>
            </div>

            <button
              type="button"
              disabled={disabled}
              onClick={(e) => {
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
          <div className={`h-full p-4 flex flex-col justify-between ${sel ? 'bg-ink text-sand-50' : 'bg-white/80 text-ink'}`}>
            <div>
              <p className={`text-[10px] font-mono uppercase tracking-widest mb-2 ${sel ? 'text-sand-200/70' : 'text-ink-muted'}`}>
                Example
              </p>

              <p className={`text-sm leading-relaxed ${sel ? 'text-sand-50' : 'text-ink'}`}>
                {word.example || 'No example generated yet.'}
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
        </section>

        {/* ── Grammar ── */}
        <section className="mb-8">
          <div className="flex items-baseline justify-between mb-2">
            <p className="text-xs font-mono uppercase tracking-widest text-ink-muted">Grammar Bank</p>
            {selectedGrammar.length > 0 && (
              <p className="text-xs font-mono text-teal">{selectedGrammar.length} selected</p>
            )}
          </div>
          <p className="text-xs text-ink-muted mb-4">Optional. Choose any patterns you want to try using.</p>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-4">
            {(['all','beginner','intermediate'] as const).map(f => (
              <button key={f} onClick={() => setGrammarFilter(f)}
                className={`chip capitalize transition-colors ${grammarFilter === f
                  ? 'bg-ink text-sand-50 border-ink'
                  : 'border-stone text-ink-muted hover:border-ink/30'}`}>
                {f}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            {filteredGrammar.map((g: Grammar) => {
              const sel = selectedGrammar.some(x => x.id === g.id);
              return (
                <button key={g.id} onClick={() => toggleGrammar(g)}
                  className={`text-left p-4 rounded-xl border transition-all duration-150
                    ${sel
                      ? 'border-teal bg-teal/8'
                      : 'border-stone bg-white/50 hover:border-ink/30'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm font-medium text-ink">{g.korean}</p>
                      <p className="text-xs text-ink-muted mt-0.5">{g.english}</p>
                      <p className="text-xs italic text-ink/60 mt-1.5">{g.example}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex-shrink-0 mt-0.5 flex items-center justify-center
                      ${sel ? 'border-teal bg-teal' : 'border-stone'}`}>
                      {sel && <span className="text-white text-[10px]">✓</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-sand/95 backdrop-blur border-t border-stone px-5 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-ink">
              <span className="font-semibold">{wordCount}</span> words
              {selectedGrammar.length > 0 && <> · <span className="font-semibold">{selectedGrammar.length}</span> grammar</>}
            </p>
            {!canStart && (
              <p className="text-xs text-coral mt-0.5">Select at least 5 words to start</p>
            )}
          </div>
          <button onClick={() => navigate('/record')} disabled={!canStart}
            className="btn-primary whitespace-nowrap">
            Start Speaking →
          </button>
        </div>
      </div>
    </div>
  );
}
