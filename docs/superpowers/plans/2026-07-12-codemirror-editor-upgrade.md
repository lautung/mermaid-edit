# CodeMirror 6 Editor Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Inline execution is selected by the Codex task mode; execute the checklist directly with checkpoints.

**Goal:** Replace the native Mermaid source textarea with a controlled CodeMirror 6 editor while preserving the existing Mermaid preview, status, layout, and export behavior.

**Architecture:** `MermaidCodeEditor` owns a CodeMirror `EditorView` and exposes only `value` and `onChange`. `EditorPane` remains responsible for the surrounding Ant Design tabs, status alert, and source statistics. The existing App state and Mermaid rendering hook remain the single source of truth outside the editor.

**Tech Stack:** React 18, TypeScript, Vite, CodeMirror 6, Vitest, jsdom, existing Ant Design and Mermaid packages.

## Global Constraints

- Keep the change scoped to the editor input experience.
- Preserve the existing `EditorPane` `value` / `onChange` contract.
- Do not change Mermaid rendering, theme selection, or SVG/PNG/JPG export behavior.
- Keep UTF-8 source files and pass `npm run lint` plus `npm run build`.

## File Map

- Create: `src/components/MermaidCodeEditor.tsx` — controlled CodeMirror wrapper and lifecycle cleanup.
- Modify: `src/components/EditorPane.tsx` — replace textarea with the new editor component.
- Create: `src/components/MermaidCodeEditor.test.tsx` — behavior tests using jsdom and CodeMirror DOM.
- Modify: `package.json` and `package-lock.json` — CodeMirror and test dependencies/scripts.

### Task 1: Add the failing editor behavior tests

**Files:**
- Create: `src/components/MermaidCodeEditor.test.tsx`

- [ ] Write tests that render the component with initial Mermaid source and assert the CodeMirror content contains that source.
- [ ] Use `EditorView.findFromDOM` to dispatch a real document change and assert `onChange` receives the updated source.
- [ ] Rerender with a changed external `value` and assert the CodeMirror document is synchronized.

Run: `npm test -- --run src/components/MermaidCodeEditor.test.tsx`

Expected: FAIL because `MermaidCodeEditor` does not exist yet.

### Task 2: Add minimal CodeMirror implementation

**Files:**
- Create: `src/components/MermaidCodeEditor.tsx`

- [ ] Create the editor view in a `useEffect` with `EditorState.create({ doc: value, extensions })`.
- [ ] Include CodeMirror basic setup, line numbers, active-line highlighting, bracket matching, history, and `indentWithTab`.
- [ ] Add an update listener that calls `onChange` only when `update.docChanged` is true.
- [ ] Synchronize changed external values by dispatching a full document replacement only when the current document differs.
- [ ] Destroy the editor view in the effect cleanup.

Run: `npm test -- --run src/components/MermaidCodeEditor.test.tsx`

Expected: PASS for all editor behavior tests.

### Task 3: Integrate the editor into the existing pane

**Files:**
- Modify: `src/components/EditorPane.tsx`

- [ ] Import `MermaidCodeEditor`.
- [ ] Replace the native textarea while preserving `className="codeEditor"`, `value`, `onChange`, and `aria-label` semantics.
- [ ] Keep the existing line count, character count, status alert, and disabled Markdown tab unchanged.

Run: `npm test -- --run`

Expected: PASS with the existing editor behavior covered.

### Task 4: Verify project quality and browser behavior

**Files:**
- No additional source files.

- [ ] Run `npm run lint` and fix only issues caused by this change.
- [ ] Run `npm run build` and confirm TypeScript/Vite output succeeds.
- [ ] Run the dev server and verify desktop and 390px mobile layouts: typing updates preview, invalid Mermaid displays the existing error state, and export controls remain available for valid diagrams.

Run:

```powershell
npm test -- --run
npm run lint
npm run build
```

Expected: all commands exit with code 0 and no editor layout overflow is visible.
