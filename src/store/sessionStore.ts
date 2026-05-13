import { create } from 'zustand';
import type { Topic, Word, Grammar, WordMix, FeedbackReport } from '../types';

interface State {
  // Screen 1 inputs
  selectedTopic:        Topic | null;
  roughIdea:            string;
  difficultySlider:     number;   // 1–5
  wordMix:              WordMix;

  // Screen 2 data
  recommendedWords:     Word[];
  selectedWords:        Word[];
  selectedGrammar:      Grammar[];

  // Screen 3–4
  recordingBlob:        Blob | null;
  usedWordIds:          string[];
  usedGrammarIds:       string[];

  // Screen 5
  feedback:             FeedbackReport | null;

  // Actions
  setTopic:             (t: Topic) => void;
  setRoughIdea:         (s: string) => void;
  setDifficulty:        (n: number) => void;
  setWordMix:           (m: WordMix) => void;
  setRecommendedWords:  (w: Word[]) => void;
  toggleWord:           (w: Word) => void;
  toggleGrammar:        (g: Grammar) => void;
  setRecording:         (b: Blob | null) => void;
  toggleUsedWord:       (id: string) => void;
  toggleUsedGrammar:    (id: string) => void;
  setFeedback:          (f: FeedbackReport) => void;
  reset:                () => void;
}

const SLIDER_MIXES: Record<number, WordMix> = {
  1: { lower_beginner: 16, upper_beginner: 10, intermediate: 4  },
  2: { lower_beginner: 10, upper_beginner: 12, intermediate: 8  },
  3: { lower_beginner: 6,  upper_beginner: 10, intermediate: 14 },
  4: { lower_beginner: 3,  upper_beginner: 8,  intermediate: 19 },
  5: { lower_beginner: 0,  upper_beginner: 6,  intermediate: 24 },
};

const init = {
  selectedTopic: null, roughIdea: '', difficultySlider: 3,
  wordMix: SLIDER_MIXES[3], recommendedWords: [], selectedWords: [],
  selectedGrammar: [], recordingBlob: null, usedWordIds: [],
  usedGrammarIds: [], feedback: null,
};

export const SLIDER_MIXES_MAP = SLIDER_MIXES;

export const useStore = create<State>((set) => ({
  ...init,

  setTopic:    (selectedTopic) => set({ selectedTopic }),
  setRoughIdea:(roughIdea) => set({ roughIdea }),
  setDifficulty:(n) => set({ difficultySlider: n, wordMix: SLIDER_MIXES[n] }),
  setWordMix:  (wordMix) => set({ wordMix }),
  setRecommendedWords: (recommendedWords) => set({ recommendedWords }),

  toggleWord: (w) => set((s) => {
    const has = s.selectedWords.some(x => x.id === w.id);
    return { selectedWords: has ? s.selectedWords.filter(x => x.id !== w.id) : [...s.selectedWords, w] };
  }),

  toggleGrammar: (g) => set((s) => {
    const has = s.selectedGrammar.some(x => x.id === g.id);
    return { selectedGrammar: has ? s.selectedGrammar.filter(x => x.id !== g.id) : [...s.selectedGrammar, g] };
  }),

  setRecording: (recordingBlob) => set({ recordingBlob }),

  toggleUsedWord: (id) => set((s) => {
    const has = s.usedWordIds.includes(id);
    return { usedWordIds: has ? s.usedWordIds.filter(x => x !== id) : [...s.usedWordIds, id] };
  }),

  toggleUsedGrammar: (id) => set((s) => {
    const has = s.usedGrammarIds.includes(id);
    return { usedGrammarIds: has ? s.usedGrammarIds.filter(x => x !== id) : [...s.usedGrammarIds, id] };
  }),

  setFeedback: (feedback) => set({ feedback }),
  reset: () => set(init),
}));
