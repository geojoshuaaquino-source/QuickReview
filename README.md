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
- Clean modern academic visual system.
- Safe-area-aware app shell.

### Phase 2 — Core Flashcards
**Core implementation complete; refinement continues.**

Implemented:
- Basic Q&A cards.
- Deck creation and deck selection.
- Manual card creation.
- Search.
- Study/reveal flow and session progression.
- Local persistence.
- Suspended-card-aware study selection.
- Card browser with detail view.
- Card editing and deletion.
- Tags and filtering.
- Suspend/unsuspend controls.
- Duplicate detection.
- Sequential or shuffled sessions.
- Review records and statistics foundation.

### Phase 3 — Advanced Card Types
**Core study interactions implemented.**

Implemented:
- Reversed cards.
- Cloze cards using `{{hidden answer}}` syntax.
- Multiple choice with stored correct option.
- True/false cards.
- Typed-answer cards with normalized answer checking.
- Image cards with local image selection.
- Image-occlusion card storage and image presentation foundation.

Remaining refinement:
- True image-occlusion region/mask editor.
- Richer advanced-card editing from Library.
- Better per-type authoring guidance and validation.

### Phase 4 — Documents/Text
**In progress.**

Implemented:
- TXT and CSV card import.
- DOCX, PPTX and EPUB text extraction using local archive parsing.
- Import preview and destination-deck selection.
- Duplicate-safe card insertion.

Planned:
- PDF text extraction.
- Image OCR fallback.
- Structure reconstruction and richer normalization.
- Verification UI for extracted source content.

### Phase 5 — Optional Scheduling
Spaced repetition is a separate layer. It is not required for normal studying. A scheduler can be introduced behind the scheduler boundary without changing the basic card/session model.

Current foundation:
- Optional scheduling toggle.
- Due-date selection.
- Basic interval/ease scheduling.

### Phase 6 — Import/Export + Polish
Planned:
- Native format backup/import.
- Anki-compatible import/export where practical.
- Media handling.
- Richer statistics.
- Performance and accessibility refinement.

Backup/cloud sync remain later infrastructure rather than blockers for the core app.

## Product principles

- No AI dependency for core functionality.
- No cloud dependency for studying.
- Spaced repetition is optional.
- Advanced features should not clutter the basic experience.
- Source documents remain available for extraction verification.
- Prefer modular boundaries over a giant screen/component.
- Build the actual product, not just a UI mockup.
