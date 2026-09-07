import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppSettings, Card, CardType, Deck, Rating, ReviewRecord, StudySession, now } from '../domain/models';
import { QuickReviewRepository } from '../data/QuickReviewRepository';
import { QuickReviewService } from './QuickReviewService';

const DEFAULT_SETTINGS:AppSettings={schedulingEnabled:false,defaultSessionSize:10,theme:'system',gesturesEnabled:true};
export function useQuickReview(repo:QuickReviewRepository){
 const service=useMemo(()=>new QuickReviewService(repo),[repo]); const [decks,setDecks]=useState<Deck[]>([]); const [reviews,setReviews]=useState<ReviewRecord[]>([]); const [settings,setSettings]=useState<AppSettings>(DEFAULT_SETTINGS); const [loaded,setLoaded]=useState(false);
 const refresh=useCallback(async()=>{const [nextDecks,nextReviews,nextSettings]=await Promise.all([service.listDecks(),repo.getReviews(),repo.getSettings()]);setDecks(nextDecks);setReviews(nextReviews);setSettings({...DEFAULT_SETTINGS,...nextSettings});setLoaded(true)},[repo,service]);
 useEffect(()=>{refresh().catch(()=>setLoaded(true))},[refresh]);
 const saveSettings=useCallback(async(next:AppSettings)=>{const safe={...DEFAULT_SETTINGS,...next,defaultSessionSize:Math.max(1,Math.min(30,Math.round(next.defaultSessionSize)))};await repo.saveSettings(safe);setSettings(safe)},[repo]);
 const createDeck=useCallback(async(name:string,subject:string,accent:string)=>{const deck=await service.createDeck(name,subject,accent);setDecks(current=>[deck,...current]);return deck},[service]);
 const createCard=useCallback(async(deckId:string,front:string,back:string,type:CardType='basic',tags:string[]=[])=>{const existing=decks.find(d=>d.id===deckId)?.cards??[];const f=front.trim().toLowerCase();const b=back.trim().toLowerCase();if(existing.some(c=>c.front.trim().toLowerCase()===f&&c.back.trim().toLowerCase()===b))throw new Error('A card with the same front and back already exists in this deck.');const card=await service.createCard(deckId,front,back,type);if(tags.length)await repo.updateCard({...card,tags,updatedAt:now()});await refresh();return card},[decks,refresh,repo,service]);
 const updateCard=useCallback(async(card:Card)=>{const deck=decks.find(d=>d.id===card.deckId);const f=card.front.trim().toLowerCase();const b=card.back.trim().toLowerCase();if(!f||!b)throw new Error('Front and back are required.');if(deck?.cards.some(x=>x.id!==card.id&&x.front.trim().toLowerCase()===f&&x.back.trim().toLowerCase()===b))throw new Error('A card with the same front and back already exists in this deck.');await repo.updateCard({...card,front:card.front.trim(),back:card.back.trim(),updatedAt:now()});await refresh()},[decks,repo,refresh]);
 const deleteCard=useCallback(async(cardId:string)=>{await repo.deleteCard(cardId);await refresh()},[repo,refresh]); const toggleSuspend=useCallback(async(cardId:string)=>{await repo.toggleSuspend(cardId);await refresh()},[repo,refresh]);
 const grade=useCallback(async(session:StudySession,cardId:string,rating:Rating,elapsedMs:number)=>{await service.grade(session,cardId,rating,elapsedMs);if(session.schedulingEnabled){await refresh()}else{setReviews(current=>[...current,{id:makeReviewId(),cardId,sessionId:session.id,rating,elapsedMs,createdAt:now()}])}},[refresh,service]);
 const makeSession=useCallback(async(deck:Deck,size:number,mode:'sequential'|'random'='sequential')=>{const source=mode==='random'?{...deck,cards:[...deck.cards].sort(()=>Math.random()-.5)}:deck;return service.startSession(source,size,settings.schedulingEnabled)},[service,settings.schedulingEnabled]);
 return {decks,reviews,settings,loaded,refresh,saveSettings,createDeck,createCard,updateCard,deleteCard,toggleSuspend,grade,makeSession};
}
const makeReviewId=()=>`review_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
