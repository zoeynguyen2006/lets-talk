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
    const matchingWords = words.filter((word) => word.difficulty === difficulty);
    const shuffledWords = shuffleArray(matchingWords);

    const candidateCount = Math.min(finalCount * 12, shuffledWords.length);

    candidates.push(...shuffledWords.slice(0, candidateCount));
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

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    wordCount: words.length,
  });
});

app.post("/api/recommend", async (req, res) => {
  try {
    const { topic, roughIdea, difficultySliderValue } = req.body;

    if (!topic || !roughIdea || !difficultySliderValue) {
      return res.status(400).json({
        error: "topic, roughIdea, and difficultySliderValue are required.",
      });
    }

    const wordMix = getWordMix(Number(difficultySliderValue));
    const candidateWords = getCandidateWords(wordMix);

    console.log("Recommend request:");
    console.log("Topic:", topic);
    console.log("Rough idea:", roughIdea);
    console.log("Word mix:", wordMix);
    console.log("Candidate word count:", candidateWords.length);

    const prompt = `
You are a Korean speaking practice curriculum designer for an app called "말해봐".

The app helps beginner-to-intermediate Korean learners turn passive vocabulary into active speaking vocabulary.

Your job:
Select exactly 30 Korean vocabulary word IDs from the candidate word list that would help the user speak about their own rough idea.

Learner profile:
- Beginner-to-intermediate Korean learner.
- They may recognize many Korean words passively.
- They struggle to actively use those words when speaking.
- They need useful, natural, realistic words for a short spoken practice session.
- They are not preparing for an academic essay.
- They need words they can actually try using in a 2-minute speech.

Educational goal:
Choose words that help the user express their idea more naturally in Korean.

Do NOT choose only the easiest words.
Do NOT choose overly academic, rare, stiff, or exam-style words unless they are clearly useful for the user's rough idea.

Prioritize words that are:
- useful in real conversation
- relevant to the user's rough idea
- helpful for storytelling, feelings, opinions, daily life, or explaining experiences
- appropriate for beginner-to-intermediate learners
- likely to be recognized passively but not yet actively owned

Topic:
${JSON.stringify(topic, null, 2)}

User's rough speaking idea:
${roughIdea}

Required difficulty mix:
${JSON.stringify(wordMix, null, 2)}

Candidate words:
${JSON.stringify(candidateWords, null, 2)}

Selection rules:
1. Select exactly 30 word IDs.
2. Select only IDs that exist in the candidate word list.
3. Follow the required difficulty mix exactly.
4. Avoid duplicate IDs.
5. Do not invent new Korean words.
6. Do not change the word meanings.
7. Do not return full word objects. Return IDs only.
8. Prefer words that fit the user's rough idea, not just the broad topic.
9. Avoid words that are too generic and empty, such as "person", "time", "come", "do", "go", unless clearly needed.
10. Avoid words that are too abstract, political, technical, or academic unless the user's rough idea clearly needs them.
11. Prefer words that can naturally appear in a 2-minute spoken answer.
12. Prefer a balanced set:
   - nouns for topic content
   - verbs for actions
   - adjectives for feelings/descriptions
   - adverbs/connectors if useful for natural speech

Quality guide:
Good choices help the learner say things like:
- "At first, it felt unfamiliar."
- "I slowly got used to it."
- "I felt lonely, but the situation got better."
- "Compared to before, I feel more comfortable now."
- "I had some difficulties, but I learned a lot."

Bad choices are:
- too basic and empty
- unrelated to the user's story
- too academic or essay-like
- too specific for a different situation
- awkward to force into a short speech

Return valid JSON only.
Do not include markdown.
Do not include explanations.
Do not include code fences.

Return format:
{
  "words": [
    {
      "id": "w0001",
      "example": "A short, natural Korean sentence using this word"
    }
  ]
}

Example sentence rules:
1. Write exactly one Korean example sentence for each selected word.
2. The sentence must fit the user's topic and rough speaking idea.
3. The sentence should be beginner-to-intermediate friendly.
4. The sentence should sound natural in spoken Korean.
5. Do not make the sentence too long.
6. Do not use overly academic Korean.
7. The sentence must clearly use the target word.
8. Do not include English translation.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    const parsed = extractJson(response.text);
    const selectedItems = parsed.words;
    
    if (!Array.isArray(selectedItems)) {
      return res.status(500).json({
        error: "Gemini response did not include words array.",
      });
    }
    
    const selectedWords = selectedItems
      .map((item) => {
        const word = words.find((w) => w.id === item.id);
        if (!word) return null;
    
        return {
          ...word,
          example: item.example,
        };
      })
      .filter(Boolean);
    
    return res.json({
      words: selectedWords,
      wordMix,
    });

  } catch (error) {
    console.error("Recommend error:", error);
    return res.status(500).json({
      error: "Failed to recommend words.",
    });
  }
});

app.post("/api/feedback", async (req, res) => {
  try {
    const {
      topic,
      roughIdea,
      selectedWords,
      usedWords,
      missedWords,
      selectedGrammar,
      usedGrammar,
      missedGrammar,
    } = req.body;

    const prompt = `
    You are a friendly Korean speaking coach for "말해봐", a Korean speaking practice app.
    
    Your role:
    Help beginner-to-intermediate Korean learners actively use Korean words they already know passively.
    
    The user just finished one speaking practice session.
    They selected vocabulary and grammar targets, recorded themselves, listened back, and self-marked which targets they used.
    
    Important limitation:
    You do not have the audio.
    You do not have a transcript.
    Only use the self-marking data.
    Never pretend you heard the recording.
    
    Core learning philosophy:
    The goal is not perfect Korean.
    The goal is active retrieval.
    If the user missed a word, that does not mean they failed.
    It means the word is a good target for the next speaking attempt.
    
    Tone:
    - warm
    - encouraging
    - clear
    - practical
    - not too academic
    - not too long
    - explain in English
    - Korean examples should be natural and short
    
    Topic:
    ${JSON.stringify(topic, null, 2)}
    
    Rough speaking idea:
    ${roughIdea}
    
    Selected vocabulary:
    ${JSON.stringify(selectedWords, null, 2)}
    
    Vocabulary marked as used:
    ${JSON.stringify(usedWords, null, 2)}
    
    Vocabulary marked as missed:
    ${JSON.stringify(missedWords, null, 2)}
    
    Selected grammar:
    ${JSON.stringify(selectedGrammar, null, 2)}
    
    Grammar marked as used:
    ${JSON.stringify(usedGrammar, null, 2)}
    
    Grammar marked as missed:
    ${JSON.stringify(missedGrammar, null, 2)}
    
    Feedback rules:
    1. Write feedback in English.
    2. Korean example sentences should be in Korean.
    3. Do not mention pronunciation.
    4. Do not give a numerical score.
    5. Do not claim the user used something incorrectly.
    6. Do not say you listened to the audio.
    7. Do not scold the user.
    8. Keep explanations short and useful.
    9. Return valid JSON only.
    10. Do not include markdown.
    11. Do not include code fences.
    12. Do not add extra keys outside the required JSON format.
    
    For each missed word:
    - Explain why it may be hard to retrieve while speaking.
    - Give one short natural Korean sentence using the word.
    - The sentence should fit the user's topic and rough idea.
    
    For each missed grammar pattern:
    - Give one short explanation.
    - Give one short Korean example sentence using that grammar.
    - The sentence should fit the user's topic and rough idea.
    
    Return this exact JSON shape:
    {
      "encouragement": "1-2 short encouraging sentences",
      "usedSummary": "Short summary of what went well",
      "missedWords": [
        {
          "id": "word id",
          "korean": "Korean word",
          "english": "English meaning",
          "reason": "Short explanation of why this word may be hard to use while speaking",
          "example": "Natural Korean sentence using this word"
        }
      ],
      "missedGrammar": [
        {
          "id": "grammar id",
          "korean": "grammar pattern",
          "english": "meaning",
          "reason": "Short explanation of how this grammar can fit the user's topic",
          "example": "Natural Korean sentence using this grammar"
        }
      ],
      "nextSentence": "One natural Korean sentence the user can try next time"
    }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const feedback = extractJson(response.text);

    return res.json({
      feedback,
    });
  } catch (error) {
    console.error("Feedback error:", error);
    return res.status(500).json({
      error: "Failed to generate feedback.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});