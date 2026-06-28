# MusicianSuite - Project Handoff & Context

This file serves as a checkpoint for the **MusicianSuite** application. If you are continuing this project in a new chat, use the information below to immediately get up to speed on the architecture, tech stack, and roadmap.

## 🎯 Project Overview
We are building a highly interactive, ultra-modern, premium Progressive Web App (PWA) for musicians. It consists of three primary "Suites" accessed from a sleek, glassmorphic Landing Page.

## 🛠 Tech Stack
*   **Framework:** Next.js 16 (App Router) with React 18
*   **Styling:** Tailwind CSS (heavily utilizing custom values, glassmorphism, and neon gradients)
*   **Animations:** Framer Motion (for layout animations, hover states, and dynamic ambient backgrounds)
*   **Music Theory Logic:** `@tonaljs/tonal` (handles all chord parsing, transposition, and intervals)
*   **Audio Engine:** `tone` (Tone.js handles sample playback and WebAudio scheduling)
*   **Node Graph UI:** `@xyflow/react` (React Flow handles the infinite Sandbox canvas)
*   **Icons:** `lucide-react`

## 🎨 Design System & Aesthetics
*   **Theme:** Deep dark mode. Backgrounds use pure black (`#000000`) or deep zinc (`#0a0a0a`) combined with `backdrop-blur-3xl`.
*   **Color Coding:** 
    *   Piano Suite: **Emerald / Green**
    *   Guitar Suite: **Fuchsia / Pink**
    *   Theory Hub: **Cyan / Blue**
*   **Typography:** Clean, sans-serif fonts with distinct weight variations (`font-light` to `font-black`). Section titles use animated `linear-gradient` glowing text.
*   **Interactivity:** Heavy use of `whileHover` framer-motion effects, continuous rotating `conic-gradient` borders, and responsive dropdowns with `ChevronDown` icons.

## ✅ Completed Work (Phases 1-3)
1.  **Landing Page (`src/app/page.tsx`)**
    *   Animated hero text with typing effect and floating particles.
    *   Global search/answer engine popup UI.
    *   Premium glowing section titles matching the hero aesthetics.
2.  **Piano Suite (`src/app/piano/page.tsx`)**
    *   **Progression Sandbox (`PianoProgressionBuilder.tsx`):** A custom React Flow canvas to connect chords. Features custom zoom controls, global transposition, active path tracing, Tone.js playback, and MIDI export.
    *   **Chord Library (`PianoChordLibrary.tsx`):** Search any chord by root, quality, and octave. Features an "AI Quick Generator" that injects progressions into the Sandbox.
    *   **Interactive Keyboard (`PianoKeyboard.tsx`):** Visually highlights chord shapes and active notes. Accurately labels keys with their full octave note (e.g., C4).
3.  **Critical Bug Fixes**
    *   *Tone.js Audio Latency:* Extracted `Tone.Sampler` initialization into the global scope and added eager loading on mount to completely eliminate first-click lag.
    *   *React Hydration Mismatch:* Clamped floating-point background coordinate generation using `.toFixed(2)` to keep the server and client perfectly synced.

## 🚧 Roadmap & Next Steps (Phases 4-5)
The next session should pick up immediately on the following features:

### Phase 4: The Guitar Suite (`/guitar`)
*   **Live Chromatic WebAudio Tuner:** Access the user's microphone via WebAudio API to detect pitch in real-time.
*   **Dynamic SVG Fretboard:** Generate fretboards that map out complex chord shapes and scales, adapting to the user's input.
*   **Alternative Tuning Support:** Allow users to change the root tuning of the strings (Drop D, Open G, etc.) and dynamically re-calculate fingerings.

### Phase 5: The Theory Library (`/library`)
*   **Scale Dictionary:** A curated, searchable database of modes and scales.
*   **Circle of Fifths Viewer:** An interactive visual map of harmonic relationships.

---

**Prompt for new AI:**
*"Read the `PROJECT_HANDOFF.md` file in the root directory to load the context of this project, and let's begin working on Phase 4: The Guitar Suite."*
