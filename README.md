# QuickReview

A local-first native mobile flashcard/study app inspired by Anki, but designed around a cleaner, lower-friction study experience and stronger document/text handling.

## Architecture

QuickReview is being built as a layered application:

`Presentation → Application → Domain → Data`

- **Domain:** cards, decks, card types, sessions, reviews, documents, settings.
- **Application:** deck/card/session use cases and optional scheduling boundary.
- **Data:** repository interface with local persistence behind it.
- **Presentation:** screens, reusable components, design tokens, and interaction states.

The UI is no longer the data layer. The monolithic prototype has been split so future features can be added without rewriting unrelated screens.

## Phase status

### Phase 1 — Architecture + UI
**Substantially complete.**

Implemented:
- Layered project structure.
- Domain models for cards, decks, sessions, reviews and documents.
- Repository boundary.
- Central design tokens.
- Reusable presentation components.
- Home, Decks, Study, Library and Settings destinations.
- Polished mobile visual system.

### Phase 2 — Core Flashcards
**In progress.**

Implemented:
- Basic Q&A cards.
- Deck creation.
- Manual card creation.
- Deck selection.
- Search.
- Study/reveal flow.
- Session progression.
- Local persistence.
- Suspended-card-aware basic study selection.

Still to implement in Phase 2:
- Full card browser/editor.
- Tags and filtering.
- Move cards between decks.
- Duplicate detection.
- Suspend/unsuspend controls.
- Session configuration and preview.
- Proper review history/statistics.

### Phase 3 — Advanced Card Types
Next after the Phase 2 core is stable:
- Reversed
- Cloze
- Multiple choice
- True/false
- Typed answer
- Image cards
- Image occlusion

### Phase 4 — Documents/Text
PDF, DOCX, PPTX, EPUB, TXT, CSV/TSV, images, OCR fallback, structure reconstruction, normalization, verification UI and structured-text import.

### Phase 5 — Optional Scheduling
Spaced repetition is a separate layer. It will not be required for normal studying. FSRS can be introduced behind the scheduler boundary without changing the basic card/session model.

### Phase 6 — Import/Export + Polish
Native format, Anki-compatible import/export where practical, media handling, richer statistics, performance and accessibility refinement.

Backup/cloud sync remain later infrastructure rather than blockers for the core app.

## Product principles

- No AI dependency for core functionality.
- No cloud dependency for studying.
- Spaced repetition is optional.
- Advanced features should not clutter the basic experience.
- Source documents remain available for extraction verification.
- Prefer modular boundaries over a giant screen/component.
- Build the actual product, not just a UI mockup.
