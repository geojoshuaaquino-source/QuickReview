import { Card, CardType, Deck, makeId, now, Rating, ReviewRecord, StudySession } from '../domain/models';
import { QuickReviewRepository } from '../data/QuickReviewRepository';

const DAY_MS = 24 * 60 * 60 * 1000;
const AGAIN_MS = 10 * 60 * 1000;

type CardDetails = {
 options?: string[];
 correctOption?: number;
 imageUri?: string;
 examples?: string[];
};

export class QuickReviewService {
 constructor(private repo:QuickReviewRepository){}
 async listDecks(){return this.repo.getDecks()}
 async createDeck(name:string,subject:string,accent:string):Promise<Deck>{const t=now();const d:Deck={id:makeId('deck'),name:name.trim(),subject:subject.trim()||'Personal study',accent,createdAt:t,updatedAt:t,cards:[]};await this.repo.saveDeck(d);return d}
 async createCard(deckId:string,front:string,back:string,type:CardType='basic',details:CardDetails={}):Promise<Card>{const t=now();const c:Card={id:makeId('card'),deckId,type,front:front.trim(),back:back.trim(),examples:details.examples??[],tags:[],createdAt:t,updatedAt:t,suspended:false,...(details.options?{options:details.options}:{}),...(details.correctOption!==undefined?{correctOption:details.correctOption}:{}),...(details.imageUri?{imageUri:details.imageUri}:{})};await this.repo.saveCard(c);return c}
 async startSession(deck:Deck,size:number,schedulingEnabled=false):Promise<StudySession>{
  const current=Date.now();
  const active=deck.cards.filter(c=>!c.suspended);
  const source=schedulingEnabled
   ? [...active].sort((a,b)=>{
      const aDue=a.dueAt?new Date(a.dueAt).getTime():0;
      const bDue=b.dueAt?new Date(b.dueAt).getTime():0;
      return aDue-bDue;
    }).filter(c=>!c.dueAt||new Date(c.dueAt).getTime()<=current)
   : active;
  const ids=source.slice(0,size).map(c=>c.id);
  return{id:makeId('session'),deckId:deck.id,cardIds:ids,currentIndex:0,startedAt:now(),schedulingEnabled};
 }
 async grade(session:StudySession,cardId:string,rating:Rating,elapsedMs:number):Promise<ReviewRecord>{
  const record:ReviewRecord={id:makeId('review'),cardId,sessionId:session.id,rating,elapsedMs,createdAt:now()};
  await this.repo.recordReview(record);
  if(!session.schedulingEnabled)return record;
  const decks=await this.repo.getDecks();
  const deck=decks.find(d=>d.id===session.deckId); const card=deck?.cards.find(c=>c.id===cardId);
  if(!card)return record;
  const previous=Math.max(0,card.intervalDays ?? 0);
  const ease=card.ease ?? 2.5;
  let intervalDays=previous;
  let nextEase=ease;
  let dueAt:string;
  if(rating==='again'){intervalDays=0;dueAt=new Date(Date.now()+AGAIN_MS).toISOString();nextEase=Math.max(1.3,ease-0.2);}
  else if(rating==='hard'){intervalDays=Math.max(1,Math.round((previous||1)*1.2));dueAt=new Date(Date.now()+intervalDays*DAY_MS).toISOString();nextEase=Math.max(1.3,ease-0.15);}
  else if(rating==='good'){intervalDays=previous?Math.max(1,Math.round(previous*ease)):1;dueAt=new Date(Date.now()+intervalDays*DAY_MS).toISOString();}
  else {intervalDays=previous?Math.max(1,Math.round(previous*(ease+0.5))):4;dueAt=new Date(Date.now()+intervalDays*DAY_MS).toISOString();nextEase=Math.min(3.2,ease+0.15);}
  await this.repo.updateCard({...card,intervalDays,ease:nextEase,dueAt,updatedAt:now()});
  return record;
 }
}
