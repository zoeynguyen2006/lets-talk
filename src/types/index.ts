export type Difficulty = 'lower_beginner' | 'upper_beginner' | 'intermediate';

export interface Word {
  id: string;
  korean: string;
  english: string;
  difficulty: Difficulty;
}

export interface Grammar {
  id: string;
  korean: string;   // the pattern e.g. "A/V~(으)면"
  english: string;  // meaning
  example: string;  // Korean example sentence
}

export interface Topic {
  id: string;
  korean: string;
  english: string;
  icon: string;
  chips: string[];
}

export interface WordMix {
  lower_beginner: number;
  upper_beginner: number;
  intermediate: number;
}

export interface MissedFeedback {
  id: string;
  korean: string;
  english: string;
  reason: string;
  example: string;
}

export interface FeedbackReport {
  encouragement: string;
  missedWords: MissedFeedback[];
  missedGrammar: MissedFeedback[];
  nextSentence: string;
}
