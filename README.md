# Studio Noir — AI Content Pipeline Mobile Application

Welcome to **Studio Noir**, an end-to-end AI-Orchestrated Content Pipeline mobile application built with **Expo (React Native)**, **TypeScript**, **NativeWind (Tailwind CSS)**, and **Google Gemini APIs**. 

Studio Noir delivers a dark, high-contrast creative editing-suite experience where complex visual ideas are broken down, generated, refined, and packaged for social platforms. It combines **on-device intelligence (local Gemma 4)** and **state-of-the-art cloud model chaining (NB2 Lite & Gemini Omni Flash)** to turn simple concepts into high-fidelity animated content.

---

## 📽️ System Walkthrough & User Flow

The application follows a structured, zero-dead-end flow spanning five dedicated screens:

```
┌────────────────────────┐      ┌────────────────────────┐      ┌────────────────────────┐
│ Screen 1: Home         │ ───> │ Screen 2: Supervisor   │ ───> │ Screen 3: Image Grid   │
│ Prompt & Style Select  │      │ Gemma Task Planning    │      │ NB2 Lite Parallel Gen  │
└────────────────────────┘      └────────────────────────┘      └────────────────────────┘
                                                                            │
                                                                            ▼
┌────────────────────────┐      ┌────────────────────────┐      ┌────────────────────────┐
│ Screen 5: Post         │ <─── │ Screen 4: Video Studio │ <─── │ User Selection         │
│ Composer & Social Mock │      │ Omni Flash Conversational Edit│ Selected Image         │
└────────────────────────┘      └────────────────────────┘      └────────────────────────┘
```

1. **Screen 1: Prompt & Template Selection (`HomeScreen.tsx`)**
   * Express your creative intent through a multi-line input panel.
   * Pick one or multiple visual style templates: `🎬 Cinematic`, `📦 Product`, `⬜ Minimalist`, and `🌈 Vibrant`.
2. **Screen 2: Supervisor / Task Planner (`SupervisorScreen.tsx`)**
   * Acts as the orchestration brain. Decomposes the high-level intent into unique style-tailored image generation prompts (one per selected style).
   * Features a pulsing, glowing AI-thinking indicator and staggered task generation chips.
3. **Screen 3: Image Candidate Grid (`ImageGridScreen.tsx`)**
   * Fans out parallel generation requests in a 2-column card grid.
   * Leverages custom skeleton shimmer components and seamless multi-select selection state with badge indicators.
4. **Screen 4: Video Studio (`VideoStudioScreen.tsx`)**
   * Selected image is uploaded and processed to yield a high-quality looping video output.
   * Highlights an **interactive, single-turn conversational refinement** input at the bottom (e.g. *"make it slower"*, *"swap the sky"*), re-submitting with full prompt history to modify the output.
   * Displays an AI-composed social caption tailored to the visual.
5. **Screen 5: Post Composer (`PostComposerScreen.tsx`)**
   * Aggregates the media preview and generated caption.
   * Offers custom social platform toggles (`Instagram`, `TikTok`, `X`, `LinkedIn`).
   * Clicking "Post Now" triggers a simulated posting operation complete with checkmark animations and success state, then safely routes back to Screen 1.

---

## 🧠 Core Chaining & Model Architecture

Studio Noir optimizes execution by dividing processing between ultra-fast edge intelligence and heavy-duty creative generation cloud APIs:

| Stage / Layer | Model / Library Used | Purpose & Function |
|---|---|---|
| **On-Device Orchestrator (Target)** | `react-native-litert-lm` <br> (Gemma 4 E2B-IT) | Low-latency local processing. Intended for local parsing and intent analysis. |
| **API Fallback Supervisor (Demo)** | `gemini-2.5-flash` | Safe, high-concurrency API fallback to parse prompt intent into strict JSON arrays of sub-tasks (`SubTask[]`). |
| **Parallel Image Generation** | **NB2 Lite** (`gemini-3.1-flash-lite-image`) | Heavy parallel fanning. Generates individual image variants in response to sub-task specifications, outputting inline Base64 images. |
| **Video Generation & Edit** | **Gemini Omni Flash** (`gemini-omni-flash-preview`) | Context-aware animation. Takes Base64 input + instruction to output video files. Maintains history state for multi-turn editing. |

### Advanced: On-Device Gemma 4 Playground (`LocalLLM.tsx`)
The app embeds a fully functional on-device Gemma sandbox component using `react-native-litert-lm` with local model caching (~2.5 GB model), chunked response token streaming, and persistent memory across restarts using `AsyncStorage`.

---

## 🎨 Design Language: Studio Noir

The application is styled with a highly calibrated, cohesive **Studio Noir** theme designed to emulate modern professional editing platforms (such as Figma or CapCut).

### Color Tokens (`tailwind.config.js`)
* **Background (`bg-noir`):** `#0B0B0F` (rich, slightly-blue dark void)
* **Surface Panel (`bg-surface`):** `#17171D` (warm charcoal for card panels)
* **Primary Accent (`accent-violet`):** `#7C5CFF` (vibrant electric violet for focus states and primary actions)
* **Secondary Accent (`accent-mint`):** `#3DDC97` (pure mint green exclusively for successful completions)
* **Text Main (`text-primary`):** `#F5F5F7`
* **Text Muted (`text-muted`):** `#8A8A94`

### Typography & Visual Motifs
* **Typography:** Modern, structured combination of **Space Grotesk** (screen headers/technical indicators) and **Inter** (captions, inputs, and controls).
* **Flat Overlays & Radials:** Extremely calm, flat layout design with exactly one exception: a low-opacity radial electric violet glow behind the Supervisor's "AI is thinking" dot.
* **Loading Polishes:** No generic loading spinners in content areas. Loading cards are built using Custom Reanimated Shimmers (`SkeletonShimmer.tsx`) that fade seamlessly as images populate.

---

## 📂 Project Structure Map

```
/
├── App.tsx                     # Entry navigator & route setup
├── index.ts                    # Expo main registration
├── package.json                # Dependencies, Expo modules & scripts
├── tailwind.config.js          # Studio Noir theme colors & font mappings
├── components/                 # Reusable UI Components
│   ├── ImageCard.tsx           # Image candidate with selection status and shimmer loader
│   ├── VideoPlayer.tsx         # Video player built on expo-av with loops & play controls
│   ├── SkeletonShimmer.tsx     # Reanimated-powered pulse loader
│   ├── TemplateChip.tsx        # Style option pill (Cinematic, Product, Minimalist, etc.)
│   └── LocalLLM.tsx            # Local Gemma 4 sandbox interface (Streaming/Storage)
├── screens/                    # Step-by-step pipeline interfaces
│   ├── HomeScreen.tsx          # Screen 1: Prompt & template entry
│   ├── SupervisorScreen.tsx    # Screen 2: Staggered Gemma sub-task decomposer
│   ├── ImageGridScreen.tsx     # Screen 3: Parallel NB2 Lite image list
│   ├── VideoStudioScreen.tsx   # Screen 4: Omni Flash video converter & edit loop
│   ├── PostComposerScreen.tsx  # Screen 5: Social media post simulation
│   └── types.ts                # Screen navigation stack parameter types
├── lib/                        # API & local LLM helpers
│   ├── gemma.ts                # Fallback task decomposer (gemini-2.5-flash API)
│   ├── nb2.ts                  # NB2 Lite parallel image fetcher
│   └── omniFlash.ts            # Omni Flash video generation & edit session wrapper
└── types/
    └── index.ts                # App-wide interfaces (SubTask, GeneratedImage, VideoResult)
```

---

## ⚙️ Setup & Installation

Follow these steps to run Studio Noir locally on your machine, simulator, or device:

### 1. Prerequisites
Ensure you have the following installed on your machine:
* **Node.js** (v18 or above)
* **pnpm** (preferred) or npm
* **Expo Go app** on your iOS/Android physical device, or configured Simulator environments in Xcode / Android Studio.

### 2. Install Dependencies
Clone the repository and install packages:
```bash
pnpm install
```

### 3. Add Environment Keys
The application interacts directly with the Google Gemini Developer APIs. Create a `.env` file or export your system environments to include your API key:
```bash
# Create a .env file in the root
EXPO_PUBLIC_GEMINI_API_KEY="your_gemini_api_key_here"
```

### 4. Boot up Expo Server
To launch the interactive packager:
```bash
pnpm start
```
* **To run on iOS Simulator:** Press `i` in your terminal window (requires Xcode).
* **To run on Android Emulator:** Press `a` in your terminal window (requires Android Studio).
* **To run on physical device:** Scan the QR code in your terminal using the Expo Go app.

---

## 🎬 Live Hackathon Demo Script (90-Second Run)

Make the most of your presentation with this ultra-clear demo pathway:

1. **The Hook (0:00 - 0:15):** Showcase Screen 1. Type: `"A neon futuristic hypercar speeding on a rainy cyberpunk street."` and select **Cinematic** and **Vibrant** visual templates. Explain that we are using on-device/low-latency intelligence to plan generation.
2. **The Decomposer (0:15 - 0:30):** Click Generate. Highlight Screen 2 ("Gemma is thinking"). Point out how the supervisor split the broad prompt into two specific variations (Cinematic variant, Vibrant variant) in parallel without server round trips.
3. **The Parallel Candidates (0:30 - 0:45):** On Screen 3, watch the Reanimated shimmers resolve into high-resolution cyberpunk hypercars. Select your favorite car and click **Animate Selected**.
4. **The Magic Motion (0:45 - 1:15):** On Screen 4, watch the static image convert into an animated MP4 file. Play/pause with the controls. Scroll down and enter: `"add flying drones and glowing trails"`. Click the arrow and show the model re-rendering the scene while preserving background coherence!
5. **The Dispatch (1:15 - 1:30):** Click **Use This**. Review the auto-generated description, toggle **Instagram** and **TikTok**, and click **Post Now** to witness the success checkmark animation. Wrap up.
