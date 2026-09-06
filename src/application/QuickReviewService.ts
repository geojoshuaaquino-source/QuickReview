import { Card, CardType, Deck, makeId, now, Rating, ReviewRecord, StudySession } from '../domain/models';
import { QuickReviewRepository } from '../data/QuickReviewRepository';

export class QuickReviewService {
 constructor(private repo:QuickReviewRepository){}
 async listDecks(){return this.repo.getDecks()}
 async createDeck(name:string,subject:string,accent:string):Promise<Deck>{const t=now();const d:Deck={id:makeId('deck'),name:name.trim(),subject:subject.trim()||'Personal study',accent,createdAt:t,updatedAt:t,cards:[]};await this.repo.saveDeck(d);return d}
 async createCard(deckId:string,front:string,back:string,type:CardType='basic'):Promise<Card>{const t=now();const c:Card={id:makeId('card'),deckId,type,front:front.trim(),back:back.trim(),examples:[],tags:[],createdAt:t,updatedAt:t,suspended:false};await this.repo.saveCard(c);return c}
 async startSession(deck:Deck,size:number):Promise<StudySession>{const ids=deck.cards.filter(c=>!c.suspended).slice(0,size).map(c=>c.id);return{id:makeId('session'),deckId:deck.id,cardIds:ids,currentIndex:0,startedAt:now(),schedulingEnabled:false}}
 async grade(session:StudySession,cardId:string,rating:Rating,elapsedMs:number){const record:ReviewRecord={id:makeId('review'),cardId,sessionId:session.id,rating,elapsedMs,createdAt:now()};await this.repo.recordReview(record)}
}
