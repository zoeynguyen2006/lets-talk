# Let's talk


A Korean speaking practice app for intermediate learners who know more words than they can actually use.

---

## The Problem

Intermediate Korean learners hit a wall. They can read, recognize vocabulary on flashcards, and follow a slow podcast but when they open their mouth, they revert to the same 50 words they've used since TOPIK Level 1. The rest of their vocabulary sits in passive memory and never migrates to active speech.

No existing app targets it directly. Duolingo is gamified repetition. Anki trains recognition. AI conversation apps let learners avoid unfamiliar words entirely by steering toward what they already control.

**Let's talk** closes the gap through **forced retrieval practice**: you choose target words before you speak, then self-evaluate which ones you actually used.

---

## Who It's For

**Primary user:** An intermediate Korean learner, who has moved past beginner content but isn't conversationally fluent. They study independently or alongside a formal program. They're frustrated that passive study has stopped producing visible progress.

**Their specific struggle:** They're not translating from English in their head. They're thinking *"what else can I say in Korean?"* and running out of paths. They know the words exist somewhere — they just can't retrieve them mid-speech. They also run out of content quickly, because they haven't thought through what they actually want to say before pressing record.

---

## How It Works

The app guides users through a structured session before they ever hit record.

```
① Setup       Choose a topic and write a rough speaking idea
② Plan        Answer 4–5 AI-generated planning questions in English
③ Words       Select 5–10 vocabulary words to target (recommended using your answers)
④ Timeline    Review your AI-generated speech plan: sections, cues, words, grammar
⑤ Record      Speak naturally using the timeline as a reference
⑥ Self-check  Listen back, mark which words and grammar you actually used
⑦ Feedback    Receive a personalised feedback report
```

### Step-by-step detail

**① Setup** — The user picks a topic (e.g. Relationships, Food, Work) and writes a rough idea in any language: *"I want to talk about my best friend. We met in university and still keep in touch."* They also set a vocabulary difficulty level on a slider.

**② Plan** — The app calls Gemini with the topic and rough idea. Gemini uses the 5W1H framework internally to generate 4–5 natural English planning questions specific to what the user wrote. The user answers in English. These answers become the foundation for everything that follows.

**③ Words** — With the cue answers now known, the app calls Gemini to select 30 vocabulary words from a curated 2,760-word database, picking words that fit the *specific* speech the user is planning — not just the broad topic. The user picks 5–10 words they want to actively try using. Each card flips to show a contextual Korean example sentence.

**④ Timeline** — Gemini reads the selected words, cue answers, and difficulty level together and builds a 4–5 section speech plan. Each section has a label (Open / The story / How you felt / The reason / Wrap up), a speaking cue rephased from the user's own answers, 2–3 mapped vocabulary words, and optionally a grammar pattern where it fits naturally. The user can add a personal note to any section.

**⑤ Record** — The timeline stays visible as a collapsible reference. Each section can be expanded to show the cue, words, grammar, and any personal note. The user presses the mic and speaks.

**⑥ Self-check** — The user listens back to their recording and taps each vocabulary word and grammar pattern they hear themselves use. 

**⑦ Feedback** — Gemini generates a coaching report based on the self-evaluation: an encouragement message, a summary of what went well, an explanation for each missed word (why it's hard to retrieve mid-speech), a new contextual example for each missed word, and one suggested sentence to try next time.

---

## Tech Stack

### Frontend

| Tool | Purpose |
|---|---|
| React + Vite | Component architecture, fast dev build |
| TypeScript | Type safety across all components and store |
| Tailwind CSS | Utility-first styling |
| React Router | Client-side routing between screens |
| Zustand | Session state (topic, words, answers, timeline, notes) |

### Backend

| Tool | Purpose |
|---|---|
| Node.js + Express | REST API server |
| Google Gemini API (`gemini-2.5-flash`) | Four AI calls: cue questions, word recommendation, timeline generation, feedback |
| dotenv | API key management |
| CORS | Cross-origin request handling |

### Data

**`server/data/words.json`** — 2,760 Korean vocabulary words sourced from TOPIK word lists, each with Korean, English, and difficulty level (`lower_beginner` / `upper_beginner` / `intermediate`). The AI selects from this list rather than generating vocabulary freely, preventing hallucination.

**Grammar** — No grammar database. Gemini generates grammar patterns contextually based on the user's difficulty setting and speech plan. This keeps grammar relevant rather than pulled from a fixed list.

---

## API Endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/cues` | Generate 4–5 planning questions from topic + rough idea |
| `POST` | `/api/recommend` | Select 30 vocabulary words informed by cue answers |
| `POST` | `/api/timeline` | Build speech plan sections + pick grammar patterns |
| `POST` | `/api/feedback` | Generate coaching report from self-evaluation data |
| `GET` | `/api/health` | Health check |

---

## Project Structure

```
malhaebwa/
├── client/
│   └── src/
│       ├── pages/
│       │   ├── SetupScreen.tsx       # Topic + rough idea + difficulty
│       │   ├── CueScreen.tsx         # Planning questions + answers
│       │   ├── SelectScreen.tsx      # Word selection (30 cards, pick 5–10)
│       │   ├── TimelineScreen.tsx    # Speech plan review + notes
│       │   ├── RecordScreen.tsx      # Recording with timeline reference
│       │   ├── EvaluateScreen.tsx    # Playback + self-marking
│       │   └── FeedbackScreen.tsx    # AI coaching report
│       ├── store/
│       │   └── sessionStore.ts       # Zustand store (full session state)
│       ├── types/
│       │   └── index.ts              # TypeScript interfaces
│       └── App.tsx                   # Router
├── server/
│   ├── data/
│   │   └── words.json                # 2,760-word TOPIK vocabulary database
│   └── index.js                      # Express app + all API routes
└── README.md
```

