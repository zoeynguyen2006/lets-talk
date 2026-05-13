import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/sessionStore';
import { TOPICS } from '../data/topics';
import type { Topic } from '../types';

const PLACEHOLDERS: Record<string, string> = {
  'daily-life':    'e.g. I want to talk about my morning routine. I usually wake up late and rush to work.',
  'food':          'e.g. I want to talk about a restaurant I love near my house. The food is cheap but really good.',
  'travel':        'e.g. I want to talk about a trip I took to Busan. It was my first time there.',
  'relationships': 'e.g. I want to talk about my best friend. We met in university and still keep in touch.',
  'work-study':    'e.g. I want to talk about my job. It\'s stressful but I\'m learning a lot.',
  'living-korea':  'e.g. I want to talk about moving to Seoul. At first I felt lonely, but I\'m slowly getting used to it.',
  'health':        'e.g. I want to talk about trying to exercise more. I started running but it\'s hard to stay consistent.',
  'future':        'e.g. I want to talk about my goal to work in Korea. I\'m not sure which city yet.',
  'technology':    'e.g. I want to talk about how I use Instagram. I spend too much time on it.',
};

const SLIDER_LABELS: Record<number, string> = {
  1: 'Mostly beginner words',
  2: 'Mostly beginner, some intermediate',
  3: 'Balanced mix',
  4: 'Mostly intermediate',
  5: 'Mostly intermediate, more challenging',
};

export default function SetupScreen() {
  const navigate = useNavigate();
  const { selectedTopic, roughIdea, difficultySlider, wordMix,
          setTopic, setRoughIdea, setDifficulty, setRecommendedWords, reset } = useStore();
  const [loading, setLoading] = useState(false);

  const canGenerate = !!selectedTopic && roughIdea.trim().length > 8;

  function handleTopicClick(topic: Topic) {
    reset();
    setTopic(topic);
  }

  async function handleGenerate() {
    if (!canGenerate || !selectedTopic) return;
  
    setLoading(true);
  
    try {
      const response = await fetch('http://localhost:3001/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: selectedTopic,
          roughIdea,
          difficultySliderValue: difficultySlider,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to generate practice set.');
      }
  
      const data = await response.json();
  
      setRecommendedWords(data.words);
      navigate('/select');
    } catch (error) {
      console.error('Generate practice set error:', error);
      alert('Could not generate words right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="min-h-screen bg-sand px-5 py-10 max-w-xl mx-auto">

      {/* Logo */}
      <header className="mb-10 animate-slide-up">
        <div className="flex items-baseline gap-3 mb-1">
          <h1 className="font-display text-4xl text-ink">말해봐</h1>
          <span className="text-ink-muted text-sm font-mono">Malhaebwa</span>
        </div>
        <p className="text-ink-muted text-sm">Tell us what you want to say. We'll find the words.</p>
      </header>

      {/* ── Step 1: Topic ── */}
      <section className="mb-8 animate-slide-up" style={{animationDelay:'60ms',animationFillMode:'both'}}>
        <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-3">
          01 — Choose a topic
        </p>
        <div className="grid grid-cols-3 gap-2">
          {TOPICS.map((t) => {
            const active = selectedTopic?.id === t.id;
            return (
              <button key={t.id} onClick={() => handleTopicClick(t)}
                className={`text-left p-3 rounded-xl border transition-all duration-150
                  ${active
                    ? 'border-coral bg-coral/8 shadow-sm'
                    : 'border-stone bg-white/50 hover:border-ink-muted/40 hover:bg-white/80'}`}>
                <span className="text-xl block mb-1">{t.icon}</span>
                <p className="font-body text-xs font-semibold text-ink leading-tight">{t.korean}</p>
                <p className="text-ink-muted text-[10px] leading-tight mt-0.5">{t.english}</p>
              </button>
            );
          })}
        </div>
        {selectedTopic && (
          <div className="mt-2 flex flex-wrap gap-1.5 animate-fade-in">
            {selectedTopic.chips.map(c => (
              <span key={c} className="chip border-stone text-ink-muted">{c}</span>
            ))}
          </div>
        )}
      </section>

      {/* ── Step 2: Rough idea ── */}
      <section className="mb-8 animate-slide-up" style={{animationDelay:'120ms',animationFillMode:'both'}}>
        <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-1">
          02 — What do you want to say?
        </p>
        <p className="text-xs text-ink-muted mb-3">Write a rough idea — not a script. English, Korean, or mixed is fine.</p>
        <textarea
          value={roughIdea}
          onChange={e => setRoughIdea(e.target.value)}
          placeholder={selectedTopic ? PLACEHOLDERS[selectedTopic.id] : 'Select a topic first…'}
          rows={4}
          disabled={!selectedTopic}
          className="w-full rounded-xl border border-stone bg-white/70 p-4 text-sm text-ink
                     placeholder:text-ink-muted/40 resize-none
                     focus:outline-none focus:border-ink/40 focus:bg-white
                     disabled:opacity-40 disabled:cursor-not-allowed
                     transition-colors duration-150"
        />
      </section>

      {/* ── Step 3: Difficulty ── */}
      <section className="mb-10 animate-slide-up" style={{animationDelay:'180ms',animationFillMode:'both'}}>
        <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-1">
          03 — Vocabulary difficulty
        </p>
        <p className="text-xs text-ink-muted mb-4">How challenging should the words be?</p>
        <div className="flex items-center gap-3">
          <span className="text-xs text-ink-muted whitespace-nowrap">Easier</span>
          <input type="range" min={1} max={5} value={difficultySlider}
            onChange={e => setDifficulty(Number(e.target.value))}
            className="flex-1 accent-coral cursor-pointer" />
          <span className="text-xs text-ink-muted whitespace-nowrap">Harder</span>
        </div>
        <p className="text-xs text-center text-teal font-mono mt-2">{SLIDER_LABELS[difficultySlider]}</p>
      </section>

      {/* ── Generate button ── */}
      <button onClick={handleGenerate} disabled={!canGenerate || loading}
        className="btn-primary w-full text-base py-4 animate-slide-up"
        style={{animationDelay:'240ms',animationFillMode:'both'}}>
        {loading ? 'Finding your words…' : 'Generate Practice Set →'}
      </button>
    </div>
  );
}
