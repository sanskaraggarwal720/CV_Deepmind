# Vibe-Coding Spec — AI Content Pipeline App
*Precision brief for AI-assisted UI generation. Feed this whole file to the coding AI before any prompt asking it to build a screen.*

---

## 1. Tech Stack

- **Framework:** Expo (managed workflow) + React Native
- **Routing:** Expo Router (file-based, screens not pages)
- **Styling:** NativeWind (Tailwind syntax on RN — NOT web Tailwind, no `next.config`, no CSS files)
- **Language:** TypeScript, strict mode
- **State:** React state + Context only — no Redux/Zustand, not worth the setup time in 5 hours
- **Animation:** `react-native-reanimated` for card transitions, loading shimmer, and the video-preview scrub
- **Icons:** `lucide-react-native`
- **Networking:** plain `fetch`, no axios — one less dependency to debug

Explicitly do NOT introduce: Next.js, web-only Tailwind, any UI kit that assumes DOM (e.g. shadcn/ui web version, Radix). If the coding AI suggests any of these, it's hallucinating the stack — reject and re-prompt.

---

## 2. Architecture

**Total screens: 5**

| # | Screen | Core function |
|---|---|---|
| 1 | **Prompt & Template Select** | User types intent, picks 1+ prompt templates (chips: Cinematic / Product / Minimalist / Vibrant) |
| 2 | **Generating (Supervisor)** | Shows Gemma decomposing the task into N sub-tasks — brief animated status, not a blank spinner |
| 3 | **Image Grid & Select** | Parallel NB2 Lite results in a grid, multi-select with checkmarks, "Animate Selected →" CTA |
| 4 | **Video Studio** | Selected image → Omni Flash video, conversational edit input at bottom ("make it slower," "swap the sky"), play/scrub controls |
| 5 | **Post Composer (mocked)** | Final video + generated caption, platform toggle chips (IG / TikTok / X / LinkedIn), "Post" → simulated success state |

**Core features (in priority order — matches the cut-list from the roadmap):**
1. Prompt template selection → parallel image generation
2. Multi-select best image(s)
3. Image → video generation via Omni Flash
4. One conversational edit turn
5. Mocked multi-platform post

**User flow:**
```
Screen 1 (input + templates)
   → Screen 2 (supervisor decomposing, ~2s transient state)
      → Screen 3 (image grid, select 1+)
         → Screen 4 (video + one conversational edit)
            → Screen 5 (mocked post) → success state, loop back to Screen 1
```
Back navigation allowed at every step (user can reselect images, retry generation). No dead ends.

---

## 3. Aesthetics

**Mood: "Studio Noir"** — a dark, high-contrast creative-tool feel, closer to a professional editing suite (think Figma dark mode, Arc browser, CapCut) than a consumer social app. This signals "serious generation tool," not "toy," which matters for a judged demo — and dark UI makes generated images/video pop, which is your actual content.

**Color palette:**
- Background: `#0B0B0F` (near-black, slight blue undertone — not pure `#000`)
- Surface / cards: `#17171D`
- Primary accent: `#7C5CFF` (electric violet — used for CTAs, active states, the "Gemma is thinking" indicator)
- Secondary accent: `#3DDC97` (mint green — used only for success states: "Posted!", generation complete)
- Text primary: `#F5F5F7`
- Text secondary/muted: `#8A8A94`
- Error/warning: `#FF5C5C`

**Typography:**
- Headings: **Space Grotesk** (or system default if font-loading eats time — geometric, slightly technical feel)
- Body/UI: **Inter**
- Scale: keep it to 4 sizes only — 28 (screen titles), 18 (section headers), 15 (body), 13 (captions/meta). Don't let the AI invent a 9-size type scale, it'll look inconsistent.

**Visual details:**
- Corner radius: 16px on cards, 12px on buttons/chips — consistent, no mixing
- No gradients except one subtle radial glow behind the "Supervisor thinking" state (violet, low opacity) — this is the one moment of visual flourish, everywhere else stays flat and calm
- Image/video grid: generous gutter (12-16px), cards should breathe — this is a showcase for generated content, UI chrome should recede
- Loading states: skeleton shimmer, not spinners — feels faster, looks more polished on stage
- Motion: fast, snappy transitions (150-200ms), nothing bouncy or playful — reinforces "professional tool" not "consumer app"

**One-line brief for the coding AI, verbatim:**
> "Dark, high-contrast creative-studio UI in the style of Figma dark mode or CapCut — not a bright consumer social app. Violet accent (#7C5CFF) for actions, mint (#3DDC97) reserved only for success states. Flat surfaces, no gradients except one subtle glow on the AI-thinking state. Space Grotesk headings, Inter body. Fast, minimal motion."
