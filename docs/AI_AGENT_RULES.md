# AI Agent Rules

AI coding agents must follow strict guidelines.

## Must
- Generate modular code
- Follow repository architecture
- Prefer reusable functions

## Must Not
- Rewrite core architecture
- Introduce large frameworks
- Duplicate logic

## Component Rules
- <200 lines per component
- Logic separated into hooks

Example:
Recorder/
Recorder.tsx
useRecorder.ts