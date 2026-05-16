import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";

dotenv.config({ path: "server/.env" });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function readJson(relativePath) {
  const fullPath = path.resolve(relativePath);
  return JSON.parse(fs.readFileSync(fullPath, "utf8"));
}

const words = readJson("server/data/words.json");

function getWordMix(sliderValue) {
  const mixes = {
    1: { lower_beginner: 16, upper_beginner: 10, intermediate: 4 },
    2: { lower_beginner: 10, upper_beginner: 12, intermediate: 8 },
    3: { lower_beginner: 6, upper_beginner: 10, intermediate: 14 },
    4: { lower_beginner: 3, upper_beginner: 8, intermediate: 19 },
    5: { lower_beginner: 0, upper_beginner: 6, intermediate: 24 },
  };

  return mixes[sliderValue] || mixes[3];
}

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function getCandidateWords(wordMix) {
  const candidates = [];

  for (const [difficulty, finalCount] of Object.entries(wordMix)) {
    const matching = words.filter((w) => w.difficulty === difficulty);
    const shuffled = shuffleArray(matching);
    candidates.push(
      ...shuffled.slice(0, Math.min(finalCount * 12, shuffled.length))
    );
  }

  return candidates;
}

function extractJson(text) {
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned);
}

async function generateJson(prompt, model = "gemini-2.5-flash") {
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  return extractJson(response.text);
}

// ─── Health ────────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ ok: true, wordCount: words.length });
});

// ─── /api/recommend ────────────────────────────────────────────────────────
// Now accepts cueAnswers so word selection is informed by the user's full plan
app.post("/api/recommend", async (req, res) => {
  try {
    const { topic, roughIdea, cueAnswers, difficultySliderValue } = req.body;

    if (!topic || !roughIdea || !difficultySliderValue) {
      return res.status(400).json({
        error: "topic, roughIdea, and difficultySliderValue are required.",
      });
    }

    const wordMix = getWordMix(Number(difficultySliderValue));
    const candidateWords = getCandidateWords(wordMix);

    const cueContext =
      Array.isArray(cueAnswers) && cueAnswers.some((a) => a?.trim())
        ? `\nUser's planning answers (use these to pick more relevant words):\n${cueAnswers
            .filter((a) => a?.trim())
            .map((a, i) => `${i + 1}. ${a}`)
            .join("\n")}`
        : "";

    const prompt = `You are a Korean speaking practice curriculum designer for "말해봐".

Select exactly 30 Korean vocabulary word IDs from the candidate list below that best help the user speak about their idea.

Topic: ${JSON.stringify(topic)}
User's rough idea: ${roughIdea}${cueContext}
Required difficulty mix: ${JSON.stringify(wordMix)}

Candidate words:
${JSON.stringify(candidateWords)}

Rules:
1. Select exactly 30 IDs from the candidate list only.
2. Follow the difficulty mix exactly.
3. Prefer words useful for real conversation: storytelling, feelings, opinions, daily life.
4. Avoid overly academic, abstract, or generic filler words unless clearly needed.
5. Write one short natural Korean example sentence per word, fitting the user's rough idea.
6. Return valid JSON only — no markdown, no code fences, no explanations.

Return format:
{
  "words": [
    { "id": "w0001", "example": "A short natural Korean sentence using this word" }
  ]
}`;

    const parsed = await generateJson(prompt);

    const selectedWords = parsed.words
      .map((item) => {
        const word = words.find((w) => w.id === item.id);
        if (!word) return null;

        return {
          ...word,
          example: item.example,
        };
      })
      .filter(Boolean);

    return res.json({ words: selectedWords, wordMix });
  } catch (error) {
    console.error("Recommend error:", error);
    return res.status(500).json({ error: "Failed to recommend words." });
  }
});

// ─── /api/cues ─────────────────────────────────────────────────────────────
// NEW: topic + roughIdea → 4-5 contextual questions using 5W1H frame internally
app.post("/api/cues", async (req, res) => {
  try {
    const { topic, roughIdea } = req.body;

    if (!topic || !roughIdea) {
      return res.status(400).json({
        error: "topic and roughIdea are required.",
      });
    }

    const prompt = `You are a Korean speaking coach helping a beginner-to-intermediate learner plan a short spoken practice session.

The user has chosen a topic and written a rough speaking idea. Your job is to generate 4 to 5 short, specific questions in English that help them think more deeply about what they want to say — so that when they speak, they have more to talk about and don't run out of content.

Use the 5W1H framework (Who, What, When, Where, Why, How) as your internal tool for generating questions, but do NOT label questions with "Who:", "What:", etc. The questions should feel natural and conversational, not like a form.

Rules:
- Questions must be specific to the user's rough idea, not generic.
- Each question should unlock a different dimension: a specific detail, a feeling or reaction, a reason or cause, a comparison or contrast, or what changed / what comes next.
- Questions should be answerable in 1-3 English sentences.
- Do not ask about Korean language itself.
- Do not ask about vocabulary or grammar.
- Keep questions short — one sentence each.
- Return 4 to 5 questions, no more.
- Return valid JSON only — no markdown, no code fences.

Topic: ${JSON.stringify(topic)}
User's rough idea: ${roughIdea}

Return format:
{
  "questions": [
    "Question one here?",
    "Question two here?",
    "Question three here?",
    "Question four here?",
    "Question five here?"
  ]
}`;

    const parsed = await generateJson(prompt);

    return res.json({ questions: parsed.questions });
  } catch (error) {
    console.error("Cues error:", error);
    return res.status(500).json({ error: "Failed to generate cue questions." });
  }
});

// ─── /api/timeline ─────────────────────────────────────────────────────────
// NEW: topic + roughIdea + selectedWords + cueAnswers + difficulty
//      → picks grammar + builds 4-5 speech timeline sections
app.post("/api/timeline", async (req, res) => {
  try {
    const {
      topic,
      roughIdea,
      selectedWords,
      cueQuestions,
      cueAnswers,
      difficultySliderValue,
    } = req.body;

    if (!topic || !roughIdea || !selectedWords || !cueAnswers) {
      return res.status(400).json({
        error: "topic, roughIdea, selectedWords, and cueAnswers are required.",
      });
    }

    const difficultyLabel =
      {
        1: "beginner (TOPIK 1-2)",
        2: "lower-intermediate (TOPIK 2-3)",
        3: "intermediate (TOPIK 3)",
        4: "upper-intermediate (TOPIK 3-4)",
        5: "advanced-intermediate (TOPIK 4)",
      }[Number(difficultySliderValue)] || "intermediate (TOPIK 3)";

    const cueContext = cueQuestions
      .map((q, i) => `Q: ${q}\nA: ${cueAnswers[i] || "(no answer)"}`)
      .join("\n\n");

    const prompt = `You are a Korean speaking coach building a personalised speech plan for a beginner-to-intermediate Korean learner.

The learner is about to do a 2-minute spoken practice session. They have selected vocabulary words they want to use. They have answered planning questions in English. Your job is to:

1. Pick 2 to 3 Korean grammar patterns appropriate for the learner's difficulty level (${difficultyLabel}).
   - Choose grammar that genuinely helps connect or extend speech for THIS topic and these answers.
   - Do not choose random grammar. Each pattern must serve a clear purpose in this specific speech.
   - Generate the grammar patterns yourself — do not use a fixed list.

2. Build 4 to 5 speech timeline sections that walk the learner through their talk.
   - Each section has a label (e.g. "Open", "The story", "How you felt", "The reason", "Wrap up").
   - Each section has a short speaking cue — rephrase one of their cue question answers as a 1-sentence English prompt they can follow while speaking. Make it feel like a gentle nudge, not a command.
   - Each section gets 2 to 3 words from the selected vocabulary that fit naturally in that section. Distribute all selected words across sections — every word should appear in exactly one section.
   - Attach one grammar pattern to the section where it fits most naturally. Not every section needs grammar — only where it genuinely helps.
   - For sections that have grammar: write one short example sentence in Korean using that grammar pattern, relevant to the section topic.

Topic: ${JSON.stringify(topic)}
Rough idea: ${roughIdea}

Cue Q&A:
${cueContext}

Selected vocabulary (use ALL of them, distribute across sections):
${JSON.stringify(
  selectedWords.map((w) => ({
    id: w.id,
    korean: w.korean,
    english: w.english,
  }))
)}

Difficulty level: ${difficultyLabel}

Return valid JSON only — no markdown, no code fences, no explanations.

Return format:
{
  "grammar": [
    {
      "id": "g1",
      "pattern": "-(으)니까",
      "meaning": "because / since (gives reason)",
      "example": "피곤하니까 일찍 잤어요."
    }
  ],
  "timeline": [
    {
      "id": "s1",
      "label": "Open",
      "cue": "Start by setting the scene — where and when does your story take place?",
      "words": [
        { "id": "w0001", "korean": "사람", "english": "person" }
      ],
      "grammar": null
    },
    {
      "id": "s2",
      "label": "The story",
      "cue": "Describe what actually happened — what's the specific moment you remember?",
      "words": [
        { "id": "w0042", "korean": "친해지다", "english": "to become close" },
        { "id": "w0089", "korean": "어색하다", "english": "to feel awkward" }
      ],
      "grammar": {
        "id": "g1",
        "pattern": "-(으)니까",
        "meaning": "because / since",
        "example": "처음 만났을 때 어색했으니까 말을 많이 못 했어요."
      }
    }
  ]
}`;

    const parsed = await generateJson(prompt);

    return res.json(parsed);
  } catch (error) {
    console.error("Timeline error:", error);
    return res.status(500).json({ error: "Failed to generate timeline." });
  }
});

// ─── /api/feedback ─────────────────────────────────────────────────────────
// Updated: grammar now comes from timeline (no grammar DB), structure adjusted
app.post("/api/feedback", async (req, res) => {
  try {
    const {
      topic,
      roughIdea,
      selectedWords,
      usedWords,
      missedWords,
      grammarPatterns,
      usedGrammarIds,
      missedGrammarIds,
    } = req.body;

    const usedGrammar = (grammarPatterns || []).filter((g) =>
      (usedGrammarIds || []).includes(g.id)
    );

    const missedGrammar = (grammarPatterns || []).filter((g) =>
      (missedGrammarIds || []).includes(g.id)
    );

    const prompt = `You are a friendly Korean speaking coach for "말해봐".

The user just finished a speaking practice session. They self-marked which target words and grammar patterns they actually used.

You do NOT have the audio or transcript. Only use the self-marking data.

Core philosophy: The goal is active retrieval, not perfect Korean. Missed words are the next session's targets — not failures.

Tone: warm, encouraging, practical, concise. Feedback in English. Korean examples in Korean.

Topic: ${JSON.stringify(topic)}
Rough idea: ${roughIdea}

Words used: ${JSON.stringify(usedWords)}
Words missed: ${JSON.stringify(missedWords)}
Grammar used: ${JSON.stringify(usedGrammar)}
Grammar missed: ${JSON.stringify(missedGrammar)}

Rules:
1. Write in English only (Korean in examples only).
2. No pronunciation feedback. No numerical scores. No scolding.
3. For each missed word: explain briefly why it's hard to retrieve mid-speech, then give one short natural Korean sentence using it, fitted to their topic.
4. For each missed grammar: explain how it could have helped in their talk, then give one short Korean example.
5. Return valid JSON only — no markdown, no code fences.

Return format:
{
  "encouragement": "1-2 warm sentences",
  "usedSummary": "Short sentence on what went well",
  "missedWords": [
    { "id": "w0001", "korean": "...", "english": "...", "reason": "...", "example": "..." }
  ],
  "missedGrammar": [
    { "id": "g1", "pattern": "...", "meaning": "...", "reason": "...", "example": "..." }
  ],
  "nextSentence": "One natural Korean sentence the user can try next time"
}`;

    const feedback = await generateJson(prompt);

    return res.json({ feedback });
  } catch (error) {
    console.error("Feedback error:", error);
    return res.status(500).json({ error: "Failed to generate feedback." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});