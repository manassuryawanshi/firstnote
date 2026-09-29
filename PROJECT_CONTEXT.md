# Chordyn - The Ultimate AI Music Platform
**Complete Architectural Blueprint & Context Documentation**

This document serves as the exhaustive, absolute source of truth for the **Chordyn** project. It is designed to be read by future AI assistants and senior engineers to understand every technical decision, UI/UX design token, architectural flow, data contract, and bug fix made during the project's development lifecycle. 

Do not edit this document without preserving the depth of its technical insights.

---

## 1. System Architecture Overview

Chordyn is a full-stack web application designed with a decoupled frontend and backend. It leverages modern web technologies to deliver an iOS-like native experience in the browser (via PWA) combined with a high-performance AI inference backend.

```mermaid
graph TD
    subgraph Frontend [Next.js App Router]
        UI[UI Components & Layouts]
        State[React Context / Hooks]
        PWA[Service Worker & Manifest]
        WebGL[Three.js Backgrounds]
    end

    subgraph Backend [FastAPI Python]
        API[API Endpoints]
        AgentCore[Agentic AI Core]
        SearchAgent[Search Agent]
        MusicKnowledge[Music Theory Knowledge Base]
    end

    UI <--> |REST fetch()| API
    API --> AgentCore
    AgentCore <--> SearchAgent
    SearchAgent <--> MusicKnowledge
```

---

## 2. Exhaustive Technical Stack

### Frontend (Next.js 14+ App Router)
- **Framework:** Next.js (App Router, Server/Client components). All interactive components are explicitly marked with `"use client";`.
- **Language:** Strict TypeScript.
- **Styling:** Tailwind CSS. Extended heavily with custom arbitrary values for pixel-perfect skeuomorphism.
- **Animations:** `framer-motion` (used for `AnimatePresence` page transitions, layout animations on dynamic islands, and interactive hover feedback).
- **Icons:** `lucide-react`. (Note: Only import specific icons to prevent Vercel build failures. Destructuring `import { Icon } from 'lucide-react'` can sometimes cause large bundle issues).
- **PWA Capabilities:** Managed via `next-pwa`. The configuration resides in `next.config.ts`. Generates `sw.js` and caches assets.
- **Audio Synthesis:** Web Audio API. Custom hooks and utilities reside in `src/lib/audio.ts` to generate oscillators for the Piano and Guitar tools.
- **3D Graphics:** `@react-three/fiber`, `@react-three/drei`. Dynamically imported with `{ ssr: false }` to prevent hydration mismatches and server-side rendering errors.

### Backend (Python FastAPI)
- **Framework:** FastAPI for high-performance async HTTP routing.
- **Language:** Python 3.9+.
- **AI/Agents:** Custom agent architecture defining a base `Agent` class and a specialized `SearchAgent` capable of processing natural language music queries against a knowledge graph.
- **Containerization:** Configured via `Dockerfile` and `docker-compose.yml`. Standard port is `8000`.
- **CORS:** The `main.py` file uses `CORSMiddleware` to explicitly allow traffic from local dev (`localhost:3000`) and the Vercel production deployment URLs.

---

## 3. Comprehensive Directory Structure

```text
Chordyn/
├── PROJECT_CONTEXT.md          # This exhaustive documentation file
├── backend/
│   ├── Dockerfile              # Python 3.9 slim configuration
│   ├── docker-compose.yml      # Orchestration for the backend
│   ├── requirements.txt        # Backend dependencies (fastapi, uvicorn, etc.)
│   ├── app/
│   │   ├── agent.py            # Base abstract class for AI agents
│   │   ├── main.py             # FastAPI entry point, CORS config, /api/v1/search
│   │   ├── search_agent.py     # Search-specific AI agent logic & NLP parsing
│   │   ├── worker.py           # Background task processing (Celery/RQ if needed)
│   │   └── knowledge.json      # Structured JSON music theory database
├── frontend/
│   ├── next.config.ts          # PWA wrapper and Next.js config
│   ├── tailwind.config.ts      # Custom theme, typography, and animation configs
│   ├── tsconfig.json           # Strict TS configuration
│   ├── public/                 
│   │   ├── manifest.json       # PWA manifest (standalone mode, theme colors)
│   │   ├── icon-192x192.png    # PWA icons (Minimalist white "FN" logo)
│   │   ├── icon-512x512.png    
│   │   └── sw.js               # Service Worker (auto-generated)
│   ├── src/
│   │   ├── app/                # Next.js App Router (File-based routing)
│   │   │   ├── api/agent/      # Frontend API route (BFF pattern to hide backend URL)
│   │   │   ├── guitar/         # Guitar tool page (/guitar)
│   │   │   ├── library/        # Interactive theory course page (/library)
│   │   │   ├── piano/          # Piano sandbox page (/piano)
│   │   │   ├── layout.tsx      # Root layout (Injects Navbar, Footer, Providers, Metadata)
│   │   │   └── page.tsx        # Home page (Hero, Quick Tools, Search)
│   │   ├── components/         # Reusable UI Components
│   │   │   ├── BackgroundScene.tsx # Three.js WebGL wrapper (dynamically imported)
│   │   │   ├── BottomNav.tsx   # Mobile-only fixed bottom navigation (iOS style)
│   │   │   ├── Footer.tsx      # Global footer with Creator section & glowing dividers
│   │   │   ├── Navbar.tsx      # Desktop top navigation
│   │   │   ├── PWARegister.tsx # Service worker registration script
│   │   │   ├── library/        # Theory Widgets:
│   │   │   │   ├── GenreDeconstructor.tsx # Interactive chord progression breakdowns
│   │   │   │   ├── EarTrainer.tsx         # Interval recognition tool
│   │   │   │   ├── CircleOfFifths.tsx     # Visual circle of fifths mapping
│   │   │   │   └── course/                # Sub-modules for specific lessons
│   │   │   └── piano/          # Piano Tools:
│   │   │       ├── PianoKeyboard.tsx      # Playable UI component
│   │   │       └── ChordLibrary.tsx       # Visual chord voicings
│   │   ├── context/            
│   │   │   └── TutorialContext.tsx # Global state (localStorage/sessionStorage) for app walkthroughs
│   │   └── lib/                
│   │       ├── audio.ts        # Web Audio API synths & playback logic
│   │       └── course-data.ts  # Structured curriculum data (JSON-like structures)
```

---

## 4. UI / UX Design System & Tokens

The application strictly adheres to a **Premium, Dark-Mode Skeuomorphic Aesthetic**. It is designed to look like high-end music production software (like Ableton or Logic Pro) combined with Apple's design language. 

Future development MUST maintain these specific styling tokens:

### A. Core Colors & Backgrounds
- **Primary Backgrounds:** `bg-black` is the absolute base. Panels and cards use `bg-zinc-950` or `bg-zinc-900/40`.
- **Glassmorphism (Frosted Glass):** 
  - Standard Card: `bg-black/60 backdrop-blur-md border border-white/10`
  - Heavy Glass: `bg-zinc-900/40 backdrop-blur-xl border border-white/5`

### B. Ambient Lighting & Glows (Skeuomorphism)
We do not use flat colors. Elements that represent "active" states or conceptual zones must emit light.
- **Button Glows:** Active buttons use exact hex-matched box shadows.
  - *Blue Active:* `bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]`
  - *Emerald Active:* `bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]`
- **Ambient Bleeds:** Large background glows are created using positioned divs with massive blurs.
  - Example: `absolute w-[800px] h-[600px] bg-gradient-to-b from-amber-500/10 via-fuchsia-500/5 blur-[150px]`

### C. Typography
- **Font Stack:** Next.js uses `next/font/google` with `GeistSans` and `GeistMono`.
- **Hero Headers:** Apple-style bold/thin contrasting headers.
  - Example: `font-bold text-white` paired with `font-light italic text-transparent bg-clip-text bg-gradient-to-r...`

### D. Mobile Responsiveness Rules
- **Navigation:** Desktop uses `Navbar.tsx` (top). Mobile hides Navbar (`hidden md:flex`) and uses `BottomNav.tsx` (fixed bottom `md:hidden fixed bottom-0`).
- **Interactive Widgets:** Horizontal scrolling areas (like chord displays) must use `overflow-x-auto` with `shrink-0` on children to prevent flexbox from crushing them on 320px wide screens.
- **Touch Targets:** Buttons must scale padding appropriately (`px-6 md:px-10 py-3 md:py-4`) and switch from full-width on mobile to auto-width on desktop (`w-full md:w-auto`).

---

## 5. Deep Dive: Core Component Mechanics

### The Dynamic Island (Quick Tools - `page.tsx`)
A fluid, pill-shaped component that acts as a command hub.
- **State:** Uses `isIslandHovered` to toggle between the collapsed (pill) state and expanded (grid) state.
- **Animation:** Powered by `framer-motion`'s `layout` prop. The container morphs its `border-radius`, `width`, and `padding` smoothly.
- **Touch Event Complexity:** On mobile, hovering doesn't exist. Tapping the pill sets `isIslandHovered` to true. **Crucial Detail:** There is a global `useEffect` document listener designed to close the global search bar when a user clicks outside of it. Originally, this listener was indiscriminately collapsing the Quick Tools the microsecond it was tapped. It was rewritten to explicitly evaluate `!quickToolsContainer.contains(e.target)` to prevent overriding mobile interactions.

### The Piano Sandbox (`PianoKeyboard.tsx`)
- **Rendering:** Maps over 88 keys (or a constrained subset). Distinguishes between natural (white) and accidental (black) keys.
- **Interactivity:** Listens to `onMouseDown`, `onMouseUp`, `onMouseLeave`, `onTouchStart`, and `onTouchEnd`. 
- **Audio:** Triggers `audio.ts` synthesis engine based on midi note values.
- **Layout:** On mobile screens, flexbox naturally attempts to shrink elements to fit the viewport. To make the piano scrollable instead of unplayable, keys must have `shrink-0` applied.

### Tutorial & Onboarding (`TutorialContext.tsx`)
- **State Persistence:** Uses `sessionStorage` and `localStorage` to track if the user has completed the "Grand Tour" onboarding.
- **Flow:** Automatically triggers step 1 after a 2000ms delay on the very first load. Routes the user through different pages (`/piano`, `/guitar`) via `router.push()` as they complete steps.

---

## 6. API Contracts & Backend Integration

The backend is a FastAPI service designed to act as an AI agent.

### Endpoints
**`GET /api/v1/search`**
- **Query Params:** `q` (string) - The user's natural language query (e.g., "What is modal interchange?")
- **Response:** JSON object containing `{ "results": [ ... ] }`.
- **Workflow:** 
  1. Frontend debounces user input by 300ms.
  2. Frontend calls `fetch(NEXT_PUBLIC_API_URL + '/api/v1/search?q=...')`.
  3. FastAPI router receives the request and passes it to `SearchAgent.execute(query)`.
  4. SearchAgent parses intent, queries the internal `knowledge.json`, formats the response, and returns it.

---

## 7. Exhaustive Bug Fix History (Timeline)

Future AIs MUST read this section before making sweeping layout changes. We have solved highly specific edge-case bugs that must not be reintroduced.

1. **Safari iOS Border-Radius Overflow Bug:** 
   - *Symptom:* iOS Safari fails to clip child elements (like glowing backgrounds) inside a container with `border-radius` and `overflow: hidden` if the children have CSS transforms applied.
   - *Fix:* Applied `transform: translateZ(0)` and `isolation: isolate` via Tailwind (`transform-gpu`, `isolate`) to the parent rounded containers.

2. **Mobile Layout Crushing (Theory Library):** 
   - *Symptom:* The main reading pane in `/library` had 0 height on mobile devices. The sidebar index was taking up the entire flex column.
   - *Fix:* Implemented a strict height constraint and flex-grow strategy (`h-[calc(100vh-160px)]` on desktop, `h-auto` on mobile) and gave the sidebar a `max-height` on mobile.

3. **Global Touch Listener Collisions (Quick Tools):** 
   - *Symptom:* The Quick Tools pill instantly collapsed when tapped on touch devices.
   - *Fix:* The `handleClickOutside` document listener in `page.tsx` was intercepting all screen taps and incorrectly evaluating the Quick Tools as "outside the search bar", thereby closing it. The listener was rewritten to treat the Search Bar and Quick Tools as mutually exclusive click-zones.

4. **Vercel Build Failures (Lucide React):** 
   - *Symptom:* Vercel threw strict build errors regarding unused imports.
   - *Fix:* Rigorous linting and cleanup of all unused imports in `page.tsx` and library widgets. Never leave unused imports in Next.js 14+ projects.

5. **The Grey Bar Artifact (`mb-32` vs `pb-32`):** 
   - *Symptom:* A solid grey horizontal bar appeared between the main content and the global footer.
   - *Fix:* The last `<motion.section>` in `page.tsx` used `mb-32` (margin-bottom). Margins push sibling elements away, exposing the empty wrapper `div`'s background (which cascaded down to the root body color). Replaced `mb-32` with padding (`pb-32`) to seamlessly extend the section's background into the footer without exposing the underlying layout gap.

6. **Mismatched UI Glow Colors:** 
   - *Symptom:* Active blue buttons in the Theory widgets had a harsh red shadow (`rgba(244,63,94)`).
   - *Fix:* A Python script (`fix_library_ui.py`) was written to regex-replace all mismatched RGBA shadow values across the entire `/components/library/course/` directory to strictly enforce the aesthetic guidelines.

---

## 8. Development & Deployment Guide

### Local Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- Access at `http://localhost:3000`.
- Environment variable `NEXT_PUBLIC_API_URL` defaults to `http://localhost:8000`.

### Local Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
- Access at `http://localhost:8000`.

### Vercel Deployment (Frontend)
The frontend is deployed to Vercel. 
- Ensure all TypeScript errors and ESLint warnings are resolved before pushing, as Vercel runs strict checks.
- Next.js caching is aggressive. If API responses seem stale, verify `Cache-Control` headers or use Next.js `revalidate` paradigms.

### Render Deployment (Backend) & Keep-Alive Hack
The FastAPI backend is deployed on Render.com (`https://firstnote-nrx1.onrender.com`).
- **The Cold Start Problem:** Render's free tier automatically puts the server to "sleep" after 15 minutes of inactivity, causing a 50-second delay for the next user.
- **The Keep-Alive Fix:** We use **cron-job.org** to automatically ping the backend URL every 10 to 14 minutes. This prevents the server from ever reaching the 15-minute idle threshold, ensuring the backend stays awake 24/7 with zero cold starts.

---
*End of Document. By reading this, you are fully synchronized with the state, history, and architectural intent of Chordyn.*
