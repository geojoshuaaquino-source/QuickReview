# QuickReview Architecture

## Direction

QuickReview uses a local-first, modular mobile architecture. The study experience must not depend on networking, AI services, or spaced repetition.

## Layers

### Presentation

Screens and reusable components handle navigation, gestures, animation, accessibility, and visual state. Presentation must not contain persistence or scheduling rules.

### Application

Use cases coordinate operations such as creating cards, starting a study session, importing a document, parsing structured text, and optionally scheduling a review.

### Domain

Core models and rules:

- Card
- CardType
- Deck
- Tag
- MediaAsset
- StudySession
- ReviewRecord
- Document
- DocumentBlock
- ImportDefinition
- Optional SchedulingState

Card types and schedulers are independent modules.

### Data

Local persistence is the primary source of truth. Repository interfaces separate the domain/application layers from the concrete database implementation.

### Document processing

Each file type has a dedicated parser adapter. Parsers produce the same internal Document representation so later stages do not need to know the source file format.

Pipeline:

`Source file -> parser -> document blocks -> structure/layout processing -> OCR fallback -> normalization -> verified Document`

OCR is used only where appropriate, especially when selectable text is unavailable.

## Optional scheduling

Scheduling is an application capability layered on top of the normal study-session system. A session can run without scheduling. FSRS can later implement the scheduler interface without changing card or UI fundamentals.

## Structured text import

The parser accepts simple human-readable fields such as:

- Term
- Definition
- Question
- Answer
- Example
- Category/Topic
- Notes
- Enumeration/list content when present
- Related-card information when explicitly represented

Enumeration is optional. Examples are optional and can occur multiple times when appropriate.

The import representation is intentionally simpler than the internal card/document model.

## UI architecture

The UI is organized around a small number of primary destinations:

1. Home — immediate access to studying and recent decks.
2. Decks — browse and organize study material.
3. Study — focused review experience.
4. Library/Import — bring in documents and structured text.
5. Settings — app and study preferences.

Secondary screens are reached contextually rather than creating unnecessary top-level navigation.

## Design requirements

- Fast launch into study.
- Clear hierarchy.
- Minimal visual noise during reviews.
- Responsive feedback.
- Deliberate animation rather than animation everywhere.
- Support light and dark themes.
- Tablet/landscape layouts should be considered from the beginning.
- Accessibility must be part of component design rather than a later patch.
