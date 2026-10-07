# Sort With Sound Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** สร้างเว็บ React/TypeScript ที่แสดงการทำงานของ Bubble, Selection, Insertion และ Quick Sort แบบมีเสียง พร้อม controls, metrics และ responsive UI ตาม design ที่อนุมัติ

**Architecture:** Pure algorithm generators emit replayable `SortStep` values. React owns the current array, run lifecycle, pause state, cancellation token and metrics; a small Web Audio service produces optional tones per step. Components are split into visual stage, controls and metrics so each boundary can be tested independently.

**Tech Stack:** Vite, React, TypeScript, Vitest, Testing Library, Web Audio API, CSS custom properties

**Spec:** `docs/superpowers/specs/2026-09-21-sort-with-sound-design.md`

## Global Constraints

- Use Vite + React + TypeScript.
- Keep algorithms free of React and Web Audio dependencies.
- Implement Bubble, Selection, Insertion and Quick Sort.
- Use Web Audio API only; audio failure must not stop sorting.
- Support pause, resume, reset and cancellation without concurrent runs.
- Keep the visual language dark, high-contrast and red-accented.
- Preserve keyboard access and non-color status information.

## Review Focus

- Duplicate and already-sorted input must remain valid and finish without losing values. Test in Task 2.
- Reset during a pending animation must prevent stale steps from mutating the new array. Test in Task 4.
- Pause/resume must continue from the same step rather than restarting. Test in Task 4.
- AudioContext creation failure must leave sorting usable. Test in Task 3.
- Narrow viewport must keep controls usable without horizontal overflow. Test in Task 5 and verify with build/runtime checks.

## File Map

- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`
- Create: `src/main.tsx`, `src/App.tsx`, `src/styles.css`
- Create: `src/types/sorting.ts`
- Create: `src/algorithms/sortSteps.ts`, `src/algorithms/sortSteps.test.ts`
- Create: `src/audio/soundEngine.ts`, `src/audio/soundEngine.test.ts`
- Create: `src/components/SortStage.tsx`, `src/components/ControlPanel.tsx`, `src/components/MetricsBar.tsx`
- Create: `src/components/AppControls.test.tsx`

### Task 1: Scaffold the Vite application

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`
- Create: `src/main.tsx`, `src/App.tsx`, `src/styles.css`

**Interfaces:**
- Produces a runnable Vite entry at `/` and a typed React app shell.

- [ ] **Step 1: Create the package and config files**

Define scripts `dev`, `build`, `test`, and `test:run`; add React, TypeScript, Vite, Vitest, jsdom and Testing Library dependencies.

- [ ] **Step 2: Add the minimal app shell**

Render an accessible page title, placeholder stage and control regions from `src/main.tsx` and `src/App.tsx`.

- [ ] **Step 3: Run the baseline build**

Run: `npm.cmd install`

Run: `npm.cmd run build`

Expected: Vite production build exits with code 0.

### Task 2: Implement replayable sorting algorithms

**Files:**
- Create: `src/types/sorting.ts`
- Create: `src/algorithms/sortSteps.ts`, `src/algorithms/sortSteps.test.ts`

**Interfaces:**
- `type AlgorithmId = 'bubble' | 'selection' | 'insertion' | 'quick'`
- `type SortStep = { values: number[]; active: number[]; sorted: number[]; pivot?: number; range?: [number, number]; kind: 'compare' | 'swap' | 'overwrite' | 'pivot' | 'complete'; comparisons: number; swaps: number }`
- `function createSortSteps(values: number[], algorithm: AlgorithmId): SortStep[]`

- [ ] **Step 1: Write failing tests for all four algorithms**

Test that each algorithm sorts `[5, 1, 4, 2, 8, 2]`, preserves length and multiset, emits at least one step, and emits a final `complete` step with sorted values. Add a test that Quick Sort emits `pivot` or a defined pivot field.

- [ ] **Step 2: Run the algorithm tests and verify RED**

Run: `npm.cmd test -- --run src/algorithms/sortSteps.test.ts`

Expected: FAIL because `createSortSteps` does not exist.

- [ ] **Step 3: Implement the step types and four generators**

Clone input values before each emitted step. Record comparisons and swaps cumulatively. Use a shared `pushStep` helper and ensure Quick Sort emits its current range and pivot.

- [ ] **Step 4: Run the algorithm tests and verify GREEN**

Run: `npm.cmd test -- --run src/algorithms/sortSteps.test.ts`

Expected: all algorithm tests pass.

### Task 3: Add resilient sound generation

**Files:**
- Create: `src/audio/soundEngine.ts`, `src/audio/soundEngine.test.ts`

**Interfaces:**
- `type SoundEngine = { play(value: number, max: number): void; close(): void }`
- `function createSoundEngine(enabled: boolean): SoundEngine`

- [ ] **Step 1: Write failing tests for sound behavior**

Test that disabled sound does not construct or use an AudioContext, enabled sound maps values to a positive frequency, and an AudioContext constructor failure is swallowed so `play` remains safe.

- [ ] **Step 2: Run sound tests and verify RED**

Run: `npm.cmd test -- --run src/audio/soundEngine.test.ts`

Expected: FAIL because the sound engine module does not exist.

- [ ] **Step 3: Implement the Web Audio service**

Create the context lazily on the first `play`, resume it when suspended, use a short oscillator gain envelope, clamp frequency to a musical range, and no-op on unsupported or blocked audio.

- [ ] **Step 4: Run sound tests and verify GREEN**

Run: `npm.cmd test -- --run src/audio/soundEngine.test.ts`

Expected: all sound tests pass.

### Task 4: Build session orchestration and controls

**Files:**
- Modify: `src/App.tsx`
- Create: `src/components/ControlPanel.tsx`, `src/components/MetricsBar.tsx`, `src/components/AppControls.test.tsx`

**Interfaces:**
- `ControlPanel` receives `algorithm`, `size`, `speed`, `soundEnabled`, `status` and callbacks for start/pause/reset/algorithm/size/speed/sound.
- `MetricsBar` receives `comparisons`, `swaps`, `step`, `totalSteps`, `elapsedMs`.

- [ ] **Step 1: Write failing interaction tests**

Test that Start changes status to running, Pause changes it to paused, Resume continues, Reset returns to idle and a new data set, and starting twice does not create two active runs. Test keyboard activation on the primary start/pause button.

- [ ] **Step 2: Run interaction tests and verify RED**

Run: `npm.cmd test -- --run src/components/AppControls.test.tsx`

Expected: FAIL because the controls and lifecycle behavior are not implemented.

- [ ] **Step 3: Implement the run lifecycle**

Generate initial values with a bounded size range, call `createSortSteps`, iterate steps asynchronously with a delay derived from speed, check a monotonically increasing run token before applying each step, await a pause gate, call `soundEngine.play`, and update status/metrics. Reset increments the token and resolves any pause gate.

- [ ] **Step 4: Run interaction tests and verify GREEN**

Run: `npm.cmd test -- --run src/components/AppControls.test.tsx`

Expected: all lifecycle tests pass without unhandled promise errors.

### Task 5: Implement the visual stage and responsive styling

**Files:**
- Create: `src/components/SortStage.tsx`
- Modify: `src/App.tsx`, `src/styles.css`

**Interfaces:**
- `SortStage` receives `values`, `active`, `sorted`, `pivot`, `algorithm`, `status`, and `metrics`; it renders one bar per value plus a live text summary.

- [ ] **Step 1: Add stage rendering tests**

Test that every value renders as a bar with a proportional height, active/pivot/sorted bars expose text or ARIA state in addition to color, and the summary announces algorithm and status.

- [ ] **Step 2: Run stage tests and verify RED**

Run: `npm.cmd test -- --run src/components/AppControls.test.tsx`

Expected: the new stage assertions fail before implementation.

- [ ] **Step 3: Implement the stage and full visual design**

Render the dark page with a red signal line/accent, monospace labels, a high-contrast bar chart, segmented controls, stats strip, and mobile layout. Use CSS variables and media queries; keep bars inside an overflow-safe stage.

- [ ] **Step 4: Run the complete test suite**

Run: `npm.cmd test -- --run`

Expected: all unit and component tests pass.

### Task 6: Verify the shipped app

**Files:**
- Modify: only files needed for verification fixes.

- [ ] **Step 1: Run the production build**

Run: `npm.cmd run build`

Expected: exit code 0 with generated Vite assets.

- [ ] **Step 2: Start the dev server**

Run: `npm.cmd run dev -- --host 127.0.0.1 --port 5173`

Expected: Vite reports the exact URL `http://127.0.0.1:5173/`.

- [ ] **Step 3: HTTP-check the actual page**

Run: `Invoke-WebRequest -UseBasicParsing http://127.0.0.1:5173/`

Expected: HTTP 200 and HTML containing the Sort With Sound app shell.

- [ ] **Step 4: Re-run tests after runtime verification**

Run: `npm.cmd test -- --run`

Expected: all tests remain green.
