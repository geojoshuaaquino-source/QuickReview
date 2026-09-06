# QuickReview

A local-first mobile flashcard and study application inspired by Anki, focused on a simpler interface, flexible card types, and broad document/text handling.

## Product principles

- No AI dependency for core functionality.
- Spaced repetition is optional, not required.
- Study quickly with minimal friction.
- Keep advanced functionality available without making the basic UI complicated.
- Preserve source documents when extracting text so users can verify extraction.
- Use modular architecture for card types, document parsers, OCR, import/export, and scheduling.

## Phase 1 status

Phase 1 establishes the application architecture and visual/UI foundation before implementing the complete study engine.

Current foundation:
- React Native + TypeScript mobile project structure.
- Navigation-ready screen architecture.
- Central design tokens.
- Main dashboard, decks, study, library/import, and settings screen placeholders.
- Reusable UI primitives intended for later feature implementation.

## Planned card/content formats

Basic Q&A, reversed, cloze, multiple choice, true/false, typed answer, image-based, and image occlusion.

## Document pipeline

`File -> format-specific parser -> structure/layout reconstruction -> OCR fallback when needed -> normalization -> internal document model`

## Structured text

QuickReview will support simple human-readable structured text for importing study material. Fields can include Term, Definition, Question, Answer, Example, Category/Topic, Notes, and enumeration/list content when present. Enumeration is optional; examples are optional and may be multiple when the source calls for them.

## Non-priority for the initial build

Backup, cloud sync, and other infrastructure-heavy features are intentionally deferred.
