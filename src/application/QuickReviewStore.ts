import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Deck, Rating, StudySession, makeId, now } from '../domain/models';
import { QuickReviewRepository } from '../data/QuickReviewRepository';
import { QuickReviewService } from './QuickReviewService';

export function useQuickReview(repo: QuickReviewRepository) {
  const service = useMemo(() => new QuickReviewService(repo), [repo]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    setDecks(await service.listDecks());
    setLoaded(true);
  }, [service]);

  useEffect(() => { refresh().catch(() => setLoaded(true)); }, [refresh]);

  const createDeck = useCallback(async (name: string, subject: string, accent: string) => {
    const deck = await service.createDeck(name, subject, accent);
    setDecks(current => [deck, ...current]);
    return deck;
  }, [service]);

  const createCard = useCallback(async (deckId: string, front: string, back: string, type = 'basic' as const, tags: string[] = []) => {
    const existing = decks.find(d => d.id === deckId)?.cards ?? [];
    const duplicate = existing.some(c => c.front.trim().toLowerCase() === front.trim().toLowerCase() && c.back.trim().toLowerCase() === back.trim().toLowerCase());
    if (duplicate) throw new Error('A card with the same front and back already exists in this deck.');
    const card = await service.createCard(deckId, front, back, type);
    if (tags.length) await repo.updateCard({ ...card, tags, updatedAt: now() });
    await refresh();
    return card;
  }, [decks, repo, refresh, service]);

  const updateCard = useCallback(async (card: Card) => { await repo.updateCard(card); await refresh(); }, [repo, refresh]);
  const deleteCard = useCallback(async (cardId: string) => { await repo.deleteCard(cardId); await refresh(); }, [repo, refresh]);
  const toggleSuspend = useCallback(async (cardId: string) => { await repo.toggleSuspend(cardId); await refresh(); }, [repo, refresh]);
  const grade = useCallback(async (session: StudySession, cardId: string, rating: Rating, elapsedMs: number) => { await service.grade(session, cardId, rating, elapsedMs); }, [service]);
  const makeSession = useCallback(async (deck: Deck, size: number, mode: 'sequential' | 'random' = 'sequential') => service.startSession(deck, size, mode), [service]);

  return { decks, loaded, refresh, createDeck, createCard, updateCard, deleteCard, toggleSuspend, grade, makeSession };
}
