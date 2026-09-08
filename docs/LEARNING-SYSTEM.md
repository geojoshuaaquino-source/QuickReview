# QuickReview Learning System

## Product model
QuickReview is a learning loop, not a flashcard viewer:

`Material → Learn → Retrieve → Feedback → Schedule → Return → Monitor`

The UI should expose the learner's current state and next useful action rather than treating decks as the primary unit of the experience.

## Core responsibilities

### Today
The command center. It answers:
- What is waiting for me?
- Why should I do it?
- What should I start with?

Today consumes `DashboardState` from the application layer. It must not independently recreate scheduling logic.

### Learn
Instruction-first. New or weak material is explained before the learner is expected to retrieve it. Definitions, meaning, examples, and context are visible. A small recall prompt can follow instruction.

### Practice
Retrieval-first. The learner attempts to recall before seeing the answer, receives immediate feedback, then rates difficulty. Direction can be term-first, meaning-first, or mixed.

### Library
Content operations: import, search, inspect, edit, suspend, and delete. Content management is separate from the cognitive practice loop.

### Decks
A management view for organizing material. A deck is a container, not the learning algorithm itself.

### Settings
Controls behavior that changes the learning loop: scheduling, session size, study direction, gestures, and theme.

## Domain state
Cards expose a derived learning stage: `new`, `learning`, `review`, or `suspended`.

The application layer derives `StudyQueue`, `DeckStudySummary`, and `DashboardState`. Presentation screens consume those states rather than implementing their own versions of queue logic.

## Scheduling
The current scheduler is intentionally lightweight and transparent. Ratings change interval/ease and produce a future due date when scheduling is enabled. It is not claimed to be FSRS or a scientifically optimal scheduler.

## Learning principles
- Initial instruction should reduce unnecessary problem-solving load for novices.
- Retrieval should be deliberate and followed by feedback.
- Spacing and interleaving are useful mechanisms for durable retention, but the product should not claim that every implementation automatically produces better learning.
- Retrieval performance is useful evidence for what should return to the learner.

## UX principle
The system should feel like one continuous loop. Navigation is infrastructure; learning state is the primary organizing concept. Avoid turning every piece of information into a card or dashboard tile.
