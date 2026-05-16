import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/sessionStore';

export default function TimelineScreen() {
  const navigate = useNavigate();
  const { selectedTopic, roughIdea, speechTimeline, grammarPatterns, sectionNotes, setSectionNote } = useStore();
  const [openNoteIds, setOpenNoteIds] = useState<string[]>([]);

  if (!selectedTopic || !speechTimeline.length) { navigate('/select'); return null; }

  function toggleNote(id: string) {
    setOpenNoteIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  return (
    <div className="min-h-screen bg-sand pb-36">
      <div className="max-w-xl mx-auto px-5 pt-8">

        {/* Back */}
        <button
          onClick={() => navigate('/select')}
          className="text-xs font-mono text-ink-muted hover:text-ink mb-6 block"
        >
          ← Edit words
        </button>

        {/* Header */}
        <div className="mb-2 animate-slide-up">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{selectedTopic.icon}</span>
            <h2 className="font-display text-3xl text-ink">Your speech plan</h2>
          </div>
          <p className="text-sm text-ink-muted mt-2 leading-relaxed">
            This is your guide for the recording. Read through it, then speak naturally — you don't need to follow it word for word.
          </p>
        </div>

        {/* Grammar pills — a quick reference at top */}
        {grammarPatterns.length > 0 && (
          <div className="mt-5 mb-7 animate-slide-up" style={{ animationDelay: '60ms', animationFillMode: 'both' }}>
            <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-2">
              Grammar to try
            </p>
            <div className="flex flex-col gap-2">
              {grammarPatterns.map(g => (
                <div key={g.id}
                  className="flex items-start gap-3 bg-teal/6 border border-teal/20 rounded-xl px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <span className="font-mono text-sm font-medium text-teal">{g.pattern}</span>
                    <span className="text-xs text-teal/70 ml-2">{g.meaning}</span>
                    {g.example && (
                      <p className="text-xs italic text-ink/60 mt-1">{g.example}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline sections */}
        <div className="flex flex-col gap-3 mb-8">
          {speechTimeline.map((section, idx) => (
            <div
              key={section.id}
              className="rounded-xl border border-stone bg-white/80 overflow-hidden animate-slide-up"
              style={{ animationDelay: `${80 + idx * 60}ms`, animationFillMode: 'both' }}
            >
              {/* Section header */}
              <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                <div className="w-6 h-6 rounded-full bg-ink flex items-center justify-center
                                text-[10px] font-mono text-sand-50 flex-shrink-0">
                  {idx + 1}
                </div>
                <p className="font-display text-base text-ink">{section.label}</p>
              </div>

              {/* Cue */}
              <div className="px-4 pb-3">
                <p className="text-sm text-ink-muted leading-relaxed italic">
                  "{section.cue}"
                </p>
              </div>

              {/* Words */}
              {section.words.length > 0 && (
                <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                  {section.words.map(word => (
                    <div
                      key={word.id}
                      className="px-3 py-1.5 bg-ink/6 border border-ink/10 rounded-full"
                    >
                      <span className="font-display text-sm text-ink">{word.korean}</span>
                      <span className="text-[10px] text-ink-muted ml-1.5">{word.english}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Grammar badge for this section */}
              {section.grammar && (
                <div className="mx-4 mb-3 mt-1 bg-teal/6 border border-teal/20 rounded-lg px-3 py-2">
                  <span className="font-mono text-xs font-medium text-teal">{section.grammar.pattern}</span>
                  <span className="text-[10px] text-teal/70 ml-2">{section.grammar.meaning}</span>
                  {section.grammar.example && (
                    <p className="text-xs italic text-ink/60 mt-1">{section.grammar.example}</p>
                  )}
                </div>
              )}

              {/* Note toggle */}
              <div className="px-4 pb-4">
                {!openNoteIds.includes(section.id) ? (
                  <button
                    onClick={() => toggleNote(section.id)}
                    className="text-xs font-mono text-ink-muted hover:text-ink transition-colors"
                  >
                    + Add note
                  </button>
                ) : (
                  <div className="animate-slide-up">
                    <textarea
                      value={sectionNotes[section.id] || ''}
                      onChange={e => setSectionNote(section.id, e.target.value)}
                      placeholder="Jot a quick note — a word, phrase, or idea to remember…"
                      rows={2}
                      className="w-full rounded-lg border border-stone bg-sand/60 px-3 py-2
                                 text-xs text-ink placeholder:text-ink-muted/40 resize-none
                                 focus:outline-none focus:border-ink/30 focus:bg-white
                                 transition-colors duration-150"
                    />
                    <button
                      onClick={() => toggleNote(section.id)}
                      className="text-[10px] font-mono text-ink-muted hover:text-ink mt-1 transition-colors"
                    >
                      ↑ Collapse
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Reminder */}
        <div className="bg-ink/4 border border-ink/8 rounded-xl p-4 mb-4 animate-slide-up"
          style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
          <p className="text-xs text-ink-muted leading-relaxed">
            💡 This plan will stay visible during your recording. Speak naturally — the cues are just reminders, not a script.
          </p>
        </div>
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-sand/95 backdrop-blur border-t border-stone px-5 py-4">
        <div className="max-w-xl mx-auto">
          <button
            onClick={() => navigate('/record')}
            className="btn-primary w-full py-4 text-base"
          >
            Start Recording →
          </button>
        </div>
      </div>
    </div>
  );
}
