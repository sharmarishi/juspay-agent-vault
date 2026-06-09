---
phase: quick-260609-kmf
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/assets/juspay-logo.png
  - src/vite-env.d.ts
  - src/components/branding/PoweredByJuspay.tsx
autonomous: true
requirements: [BRAND-LOGO-01]
must_haves:
  truths:
    - "The 'Powered by Juspay' branding shows a small Juspay logo image"
    - "The logo image is git-tracked under src/assets with no space in its filename"
    - "PNG imports type-check under TypeScript strict mode"
  artifacts:
    - path: "src/assets/juspay-logo.png"
      provides: "Juspay logo mark asset (relocated from repo root)"
    - path: "src/vite-env.d.ts"
      provides: "Vite client ambient types so .png ES imports type-check"
      contains: "vite/client"
    - path: "src/components/branding/PoweredByJuspay.tsx"
      provides: "Branding component rendering the logo image with alt text"
      contains: "import"
  key_links:
    - from: "src/components/branding/PoweredByJuspay.tsx"
      to: "src/assets/juspay-logo.png"
      via: "Vite ES asset import (import juspayLogo from ...)"
      pattern: "import .*juspay-logo\\.png"
---

<objective>
Add a small, tasteful Juspay logo image to the "Powered by Juspay" branding component.

Purpose: Strengthen the subtle co-brand (per CLAUDE.md "tasteful Juspay mark") by showing the actual 512x512 blue circular Juspay mark instead of a plain accent dot.
Output: Logo asset relocated into src/assets, Vite ambient types added so the import type-checks, and PoweredByJuspay.tsx renders the logo at ~16px with accessible alt text.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

# Component being modified (currently renders "Powered by" + JUSPAY_NAME + accent dot)
@src/components/branding/PoweredByJuspay.tsx
@src/theme/tokens.ts

<interfaces>
<!-- Branding tokens available. Use these directly — no exploration needed. -->

From src/theme/tokens.ts:
```typescript
export const JUSPAY_ACCENT = "#4F46E5";
export const JUSPAY_NAME = "Juspay";
```
</interfaces>

<environment_notes>
- This plan runs in the MAIN working tree (NOT a worktree). The untracked source
  file `juspay logo.png` (note the space) at the repo root IS accessible.
- It is a 512x512 blue circular Juspay mark, ~22KB.
- There is NO `src/assets/` directory yet — it must be created.
- There is NO `src/vite-env.d.ts` and tsconfig.json does NOT reference `vite/client`
  types. Without an ambient declaration, importing a `.png` will FAIL `tsc` under
  `strict: true`. Adding `src/vite-env.d.ts` with `/// <reference types="vite/client" />`
  is the idiomatic Vite fix and provides module declarations for static assets.
- Asset strategy decision: use the Vite ES-import approach (import from src/assets/)
  rather than public/. ES import is idiomatic for a single bundled, content-hashed
  mark and is the project-preferred approach for this single image.
- Branding decision: REPLACE the existing accent dot with the logo mark to avoid
  visual clutter (logo + dot would compete). The blue circular mark already carries
  the JUSPAY_ACCENT color, so the dot becomes redundant.
</environment_notes>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Relocate logo asset into src/assets and add Vite ambient types</name>
  <files>src/assets/juspay-logo.png, src/vite-env.d.ts</files>
  <action>
    1. Create the assets directory and move the root logo into it with a
       space-free, importable name using git so it becomes tracked:
       - `mkdir -p src/assets`
       - `git mv "juspay logo.png" src/assets/juspay-logo.png`
         (if `git mv` errors because the source is untracked, fall back to
         `mv "juspay logo.png" src/assets/juspay-logo.png` then
         `git add src/assets/juspay-logo.png`)
    2. Create src/vite-env.d.ts with the Vite client triple-slash reference so
       that importing `.png` (and other static assets) type-checks under strict
       TypeScript. Exact contents:
       ```
       /// <reference types="vite/client" />
       ```
    This unblocks Task 2's ES import. Do NOT modify tsconfig.json — the
    vite-env.d.ts is auto-included by the existing `"include": ["src"]`.
  </action>
  <verify>
    <automated>test -f src/assets/juspay-logo.png && ! test -f "juspay logo.png" && grep -q 'vite/client' src/vite-env.d.ts && echo OK</automated>
  </verify>
  <done>Logo exists at src/assets/juspay-logo.png (git-tracked), the spaced root file is gone, and src/vite-env.d.ts references vite/client.</done>
</task>

<task type="auto">
  <name>Task 2: Render the logo in PoweredByJuspay (replace accent dot)</name>
  <files>src/components/branding/PoweredByJuspay.tsx</files>
  <action>
    Modify src/components/branding/PoweredByJuspay.tsx:
    - Add an ES import at the top: `import juspayLogo from "../../assets/juspay-logo.png";`
    - REPLACE the trailing accent-dot `<span>` (the `w-1.5 h-1.5 rounded-full`
      element styled with JUSPAY_ACCENT) with an `<img>` rendering the logo mark.
      Keep it small and tasteful per CLAUDE.md subtle co-brand:
      `<img src={juspayLogo} alt="Juspay logo" className="h-4 w-4 rounded-full" />`
      (h-4 w-4 = 16px; rounded-full keeps the circular mark clean).
    - Keep the existing "Powered by" text and the {JUSPAY_NAME} accent span unchanged.
    - The JUSPAY_ACCENT import remains in use (still applied to the JUSPAY_NAME span),
      so do not remove it. Remove the now-unused accent-dot markup only.
    Rationale (decision): replacing the dot with the logo avoids logo+dot clutter
    while preserving the brand accent via the colored name and the blue mark itself.
  </action>
  <verify>
    <automated>npx tsc --noEmit && grep -q 'juspay-logo.png' src/components/branding/PoweredByJuspay.tsx && grep -q 'alt="Juspay logo"' src/components/branding/PoweredByJuspay.tsx && ! grep -q 'rounded-full"\s*$' src/components/branding/PoweredByJuspay.tsx || true</automated>
  </verify>
  <done>tsc passes; the component imports the logo from src/assets, renders an <img> at h-4 w-4 with alt="Juspay logo", and the old accent dot is gone.</done>
</task>

</tasks>

<verification>
- `npx tsc --noEmit` passes (PNG import type-checks via vite-env.d.ts).
- `git status` shows juspay-logo.png tracked under src/assets and the spaced root file removed.
- Running the dev app, the "Powered by Juspay" footer shows the small circular logo where the accent dot used to be.
</verification>

<success_criteria>
- src/assets/juspay-logo.png exists and is git-tracked; no `juspay logo.png` at repo root.
- src/vite-env.d.ts references `vite/client`.
- PoweredByJuspay renders a ~16px circular logo image with alt="Juspay logo", replacing the accent dot.
- TypeScript compiles cleanly under strict mode.
</success_criteria>

<output>
After completion, create `.planning/quick/260609-kmf-in-the-powered-by-juspay-branding-add-a-/260609-kmf-SUMMARY.md`
</output>
