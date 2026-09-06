import { AppSettings, Card, Deck, ReviewRecord, StudySession } from '../domain/models';
import { starterDecks } from '../domain/seed';

export interface QuickReviewRepository { getDecks():Promise<Deck[]>; saveDeck(deck:Deck):Promise<void>; saveCard(card:Card):Promise<void>; recordReview(record:ReviewRecord):Promise<void>; getSettings():Promise<AppSettings>; saveSettings(settings:AppSettings):Promise<void>; }

export class MemoryRepository implements QuickReviewRepository {
 private decks:Deck[]=structuredClone(starterDecks); private reviews:ReviewRecord[]=[]; private settings:AppSettings={schedulingEnabled:false,defaultSessionSize:30,theme:'system',gesturesEnabled:true};
 async getDecks(){return structuredClone(this.decks)}
 async saveDeck(deck:Deck){const i=this.decks.findIndex(d=>d.id===deck.id);if(i<0)this.decks.unshift(structuredClone(deck));else this.decks[i]=structuredClone(deck)}
 async saveCard(card:Card){const d=this.decks.find(x=>x.id===card.deckId);if(!d)throw new Error('Deck not found');d.cards.push(structuredClone(card));d.updatedAt=new Date().toISOString()}
 async recordReview(record:ReviewRecord){this.reviews.push(record)}
 async getSettings(){return {...this.settings}}
 async saveSettings(settings:AppSettings){this.settings={...settings}}
}
