# AI-Orchestrated Content Pipeline — Hackathon Roadmap
**Problem Statement 4: Conversational Video & Motion with Omni Flash**
**Time budget: 5 hours**

---

## 1. Critical correction to the original idea

Two assumptions in the original pitch don't survive contact with reality — better to know now than at hour 3.

| Assumption | Reality | Fix |
|---|---|---|
| Gemma 4 E2B generates/enhances images on-device | Gemma 4 E2B (edge variant) is multimodal **input** (text, image, audio) with **text-only output**. It's a reasoning/understanding model, not a diffusion model. | Use Gemma 4 E2B as the **on-device orchestrator/reasoning layer**. Use NB2 Lite (cloud) for actual image generation. |
| Pipeline should be "on-device" | Problem Statement 4 explicitly rewards chaining **NB2 Lite → Gemini Omni Flash**, both cloud APIs. Judges are scoring conversational cloud orchestration, not on-device purity. | Reframe the pitch: "on-device intelligence, cloud-scale generation" — Gemma decides *what* to generate, cloud models generate it. This is a stronger, truer story anyway. |

This isn't a downgrade — it's the difference between a pipeline that compiles and one that doesn't.

---

## 2. Revised architecture

```
┌─────────────────────────────────────────────────────────────┐
│  ON-DEVICE (Expo / React Native)                             │
│  Gemma 4 E2B — Supervisor Agent                              │
│  - Parses user intent + selected prompt templates             │
│  - Decomposes into N parallel sub-tasks                       │
│  - Each sub-task = {prompt variant, style params}              │
└─────────────────────────────────────────────────────────────┘
                          │  fan-out (Promise.all)
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  CLOUD — Sub-Agents (parallel calls)                          │
│  NB2 Lite (Gemini 3.1 Flash-Lite Image)                       │
│  - 3-4 parallel image generations, ~4s each                   │
│  - Returns N candidate images to device                       │
└─────────────────────────────────────────────────────────────┘
                          │  user selects 1+ favorites
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  CLOUD — Sub-Agents (parallel calls)                          │
│  Gemini Omni Flash                                             │
│  - Each selected image → animated via conversational prompt   │
│  - Multi-turn: user can say "make it slower" / "swap the sky" │
│  - Each agent also emits a short caption/content blurb        │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  ON-DEVICE — Post Composer (mocked)                            │
│  - User picks final video(s) + generated captions             │
│  - "Post to Instagram / TikTok / X" → simulated success UI     │
│  - (Framed honestly in demo as "MCP dispatch simulation")      │
└─────────────────────────────────────────────────────────────┘
```

**Why this wins on the rubric:** it's genuine multi-turn conversational video orchestration (Omni Flash), it chains NB2 Lite → Omni Flash as explicitly requested, and the on-device Gemma layer gives you a real differentiator most teams won't have (low-latency task decomposition without a server round-trip).

---

## 3. Tech stack

- **App shell:** Expo (managed workflow) + React Native, Expo Router
- **On-device model:** Gemma 4 E2B via MediaPipe LLM Inference / Google AI Edge SDK (or Antigravity's on-device runtime if it exposes a React Native / JS bridge — confirm this first, see Risk #1)
- **Image generation:** Gemini API — NB2 Lite (`gemini-3.1-flash-lite-image` or current alias — verify exact model string in AI Studio at hour 0)
- **Video generation/editing:** Gemini API — Omni Flash (`gemini-omni-flash-preview`)
- **State/orchestration:** Simple JS `Promise.all` fan-out is enough — do NOT build a real agent framework (LangGraph etc.) under time pressure
- **Social posting:** Mocked — local state + fake success toast/animation, no real OAuth

---

## 4. Hour-by-hour plan

**Hour 0 – 0:30 | Setup & spike**
- Init Expo app, get API keys, confirm exact NB2 Lite / Omni Flash model strings and quota in AI Studio
- Spike: one raw `fetch` call to NB2 Lite, one to Omni Flash, confirm both return successfully. **Do this before building any UI.**

**Hour 0:30 – 1:30 | On-device supervisor**
- Get Gemma 4 E2B running on-device (or in Expo dev client if managed workflow blocks native modules — see Risk #1)
- Hardcode 4-6 prompt templates (style variants: e.g. "cinematic," "product shot," "minimalist," "vibrant")
- Supervisor logic: user prompt + selected template(s) → array of sub-task prompts

**Hour 1:30 – 2:30 | Parallel image generation**
- Fan out sub-tasks to NB2 Lite in parallel, render results in a grid
- Loading states per-card (don't block the whole grid on the slowest call)
- Multi-select UI for "best image(s)"

**Hour 2:30 – 3:30 | Video generation + conversational editing**
- Selected image(s) → Omni Flash, generate first-pass video
- Build ONE conversational edit turn (e.g. text input "make it slower" → re-call Omni Flash with conversation history). Don't over-build multi-turn — one working turn beats five broken ones.
- Each agent also returns a caption (prompt Omni Flash / Gemma to co-emit text)

**Hour 3:30 – 4:15 | Post composer (mocked)**
- Final selection screen → "Post to [platforms]" buttons → simulated success state
- Be explicit in the UI copy that this is a demo simulation — judges respect honesty over fake claims

**Hour 4:15 – 5:00 | Buffer, polish, demo script**
- This buffer is not optional — assume something above breaks. Fix the highest-impact break, cut anything else.
- Write a 90-second demo script hitting: intent → parallel images → selection → conversational video edit → mock post. Rehearse it once.

---

## 5. Risk register

| # | Risk | Likelihood | Mitigation |
|---|---|---|---|
| 1 | Expo managed workflow can't load a native on-device LLM runtime (Gemma requires native modules) | High | Check this in the first 15 minutes, not hour 2. If blocked: use `expo prebuild` / dev client, or fall back to calling Gemma via API instead of on-device (weakens "on-device" claim but keeps you shipping) |
| 2 | Parallel cloud calls hit rate limits / quota mid-demo | Medium | Cap parallel fan-out to 3-4 requests, add retry-once logic, test your quota ceiling in hour 0 |
| 3 | Omni Flash conversational editing doesn't preserve context the way you expect | Medium | Build and test exactly one edit turn early (hour 2:30), don't assume multi-turn coherence — verify it |
| 4 | Scope creep — building real social OAuth despite deciding to mock it | Medium (self-inflicted) | You already decided: mocked. If you catch yourself opening a Twitter dev console, that's the signal to stop |
| 5 | Demo fails live (network, quota, model latency) | Medium | Record a backup screen-capture of a successful run before the demo slot |
| 6 | Gemma 4 E2B on-device latency makes the "fast local orchestration" pitch feel slow anyway | Low-Medium | Keep the supervisor prompt short and the decomposition logic simple (no chain-of-thought needed for task splitting) |

---

## 6. What to cut first if you're behind schedule

In order:
1. Multi-turn conversational editing → cut to single edit turn, or cut entirely, keep first-pass video generation
2. Number of parallel prompt templates → cut from 6 to 3
3. Mocked social posting polish → cut to a single static "Posted!" screen
4. On-device Gemma → if truly blocked, call it via API and be upfront about it in the demo ("this would run on-device via Google AI Edge; for the hackathon build we're calling it directly given the 5-hour window")

Never cut: the NB2 Lite → Omni Flash chain itself. That's the actual rubric.
