import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, Card, Deck, ReviewRecord } from '../domain/models';
import { starterDecks } from '../domain/seed';

export interface QuickReviewRepository {
  getDecks(): Promise<Deck[]>;
  saveDeck(deck: Deck): Promise<void>;
  saveCard(card: Card): Promise<void>;
  updateCard(card: Card): Promise<void>;
  deleteCard(cardId: string): Promise<void>;
  toggleSuspend(cardId: string): Promise<void>;
  recordReview(record: ReviewRecord): Promise<void>;
  getReviews(): Promise<ReviewRecord[]>;
  getSettings(): Promise<AppSettings>;
  saveSettings(settings: AppSettings): Promise<void>;
}

const DECKS_KEY = 'quickreview.decks.v1';
const REVIEWS_KEY = 'quickreview.reviews.v1';
const SETTINGS_KEY = 'quickreview.settings.v1';

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export class LocalRepository implements QuickReviewRepository {
  private decks: Deck[] | null = null;

  private async ensure() {
    if (this.decks) return;
    const raw = await AsyncStorage.getItem(DECKS_KEY);
    this.decks = raw ? JSON.parse(raw) : clone(starterDecks);
  }

  private async persist() {
    await AsyncStorage.setItem(DECKS_KEY, JSON.stringify(this.decks ?? []));
  }

  async getDecks() { await this.ensure(); return clone(this.decks!); }

  async saveDeck(deck: Deck) {
    await this.ensure();
    const i = this.decks!.findIndex(d => d.id === deck.id);
    if (i < 0) this.decks!.unshift(clone(deck));
    else this.decks![i] = clone(deck);
    await this.persist();
  }

  async saveCard(card: Card) {
    await this.ensure();
    const d = this.decks!.find(x => x.id === card.deckId);
    if (!d) throw new Error('Deck not found');
    d.cards.push(clone(card));
    d.updatedAt = new Date().toISOString();
    await this.persist();
  }

  async updateCard(card: Card) {
    await this.ensure();
    const d = this.decks!.find(x => x.id === card.deckId);
    if (!d) throw new Error('Deck not found');
    const i = d.cards.findIndex(c => c.id === card.id);
    if (i < 0) throw new Error('Card not found');
    d.cards[i] = clone(card);
    d.updatedAt = new Date().toISOString();
    await this.persist();
  }

  async deleteCard(cardId: string) {
    await this.ensure();
    for (const d of this.decks!) {
      const before = d.cards.length;
      d.cards = d.cards.filter(c => c.id !== cardId);
      if (d.cards.length !== before) d.updatedAt = new Date().toISOString();
    }
    await this.persist();
  }

  async toggleSuspend(cardId: string) {
    await this.ensure();
    for (const d of this.decks!) {
      const card = d.cards.find(c => c.id === cardId);
      if (card) {
        card.suspended = !card.suspended;
        card.updatedAt = new Date().toISOString();
        d.updatedAt = card.updatedAt;
        break;
      }
    }
    await this.persist();
  }

  async recordReview(record: ReviewRecord) {
    const raw = await AsyncStorage.getItem(REVIEWS_KEY);
    const list: ReviewRecord[] = raw ? JSON.parse(raw) : [];
    list.push(clone(record));
    await AsyncStorage.setItem(REVIEWS_KEY, JSON.stringify(list));
  }

  async getReviews() {
    const raw = await AsyncStorage.getItem(REVIEWS_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  async getSettings() {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : { schedulingEnabled: false, defaultSessionSize: 30, theme: 'system', gesturesEnabled: true };
  }

  async saveSettings(settings: AppSettings) { await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }
}
