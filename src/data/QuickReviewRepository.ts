import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, Card, Deck, ReviewRecord } from '../domain/models';
import { starterDecks } from '../domain/seed';

export interface QuickReviewRepository { getDecks():Promise<Deck[]>; saveDeck(deck:Deck):Promise<void>; saveCard(card:Card):Promise<void>; recordReview(record:ReviewRecord):Promise<void>; getSettings():Promise<AppSettings>; saveSettings(settings:AppSettings):Promise<void>; }
const DECKS_KEY='quickreview.decks.v1'; const REVIEWS_KEY='quickreview.reviews.v1'; const SETTINGS_KEY='quickreview.settings.v1';
export class LocalRepository implements QuickReviewRepository {
 private decks:Deck[]|null=null;
 private async ensure(){if(this.decks)return;const raw=await AsyncStorage.getItem(DECKS_KEY);this.decks=raw?JSON.parse(raw):structuredClone(starterDecks)}
 private async persist(){await AsyncStorage.setItem(DECKS_KEY,JSON.stringify(this.decks??[]))}
 async getDecks(){await this.ensure();return structuredClone(this.decks!)}
 async saveDeck(deck:Deck){await this.ensure();const i=this.decks!.findIndex(d=>d.id===deck.id);if(i<0)this.decks!.unshift(structuredClone(deck));else this.decks![i]=structuredClone(deck);await this.persist()}
 async saveCard(card:Card){await this.ensure();const d=this.decks!.find(x=>x.id===card.deckId);if(!d)throw new Error('Deck not found');d.cards.push(structuredClone(card));d.updatedAt=new Date().toISOString();await this.persist()}
 async recordReview(record:ReviewRecord){const raw=await AsyncStorage.getItem(REVIEWS_KEY);const list:ReviewRecord[]=raw?JSON.parse(raw):[];list.push(record);await AsyncStorage.setItem(REVIEWS_KEY,JSON.stringify(list))}
 async getSettings(){const raw=await AsyncStorage.getItem(SETTINGS_KEY);return raw?JSON.parse(raw):{schedulingEnabled:false,defaultSessionSize:30,theme:'system',gesturesEnabled:true}}
 async saveSettings(settings:AppSettings){await AsyncStorage.setItem(SETTINGS_KEY,JSON.stringify(settings))}
}
