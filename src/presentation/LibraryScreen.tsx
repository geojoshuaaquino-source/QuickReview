import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Card, Deck } from '../domain/models';
import { Button, Header } from './components';
import { theme as T } from './theme';
import { FadeIn, ScalePress } from './motion';

type Props = {
  decks: Deck[];
  onToggleSuspend: (cardId: string) => Promise<void>;
  onDelete: (cardId: string) => Promise<void>;
};

type Filter = 'all' | 'active' | 'suspended';

export function LibraryScreen({ decks, onToggleSuspend, onDelete }: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<Card | null>(null);
  const cards = useMemo(() => decks.flatMap(deck => deck.cards.map(card => ({ card, deck }))), [decks]);
  const filtered = useMemo(() => cards.filter(({ card, deck }) => {
    const haystack = `${card.front} ${card.back} ${card.tags.join(' ')} ${deck.name}`.toLowerCase();
    const matchesQuery = haystack.includes(query.trim().toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'active' ? !card.suspended : card.suspended);
    return matchesQuery && matchesFilter;
  }), [cards, filter, query]);

  return <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
    <Header title="Library" subtitle="Search, inspect and manage every card." />

    <FadeIn>
      <View style={s.importHero}>
        <View style={s.badge}><Text style={s.badgeText}>DOCUMENTS</Text></View>
        <Text style={s.importTitle}>Bring your material in</Text>
        <Text style={s.importText}>PDF, DOCX, PPTX, EPUB, TXT, CSV or images. Extraction will preserve source structure for verification.</Text>
        <Button label="Choose a file" />
      </View>
    </FadeIn>

    <View style={s.sectionHead}><View><Text style={s.sectionTitle}>All cards</Text><Text style={s.sectionMeta}>{cards.length} cards across {decks.length} decks</Text></View></View>
    <View style={s.search}><Text style={s.searchIcon}>⌕</Text><TextInput value={query} onChangeText={setQuery} placeholder="Search cards, tags or decks" placeholderTextColor={T.colors.faint} style={s.searchInput}/></View>
    <View style={s.filters}>{(['all','active','suspended'] as Filter[]).map(value => <Pressable key={value} onPress={() => setFilter(value)} style={[s.filter, filter === value && s.filterActive]}><Text style={[s.filterText, filter === value && s.filterTextActive]}>{value[0].toUpperCase() + value.slice(1)}</Text></Pressable>)}</View>

    {filtered.length === 0 ? <View style={s.empty}><Text style={s.emptyTitle}>Nothing here yet</Text><Text style={s.emptyText}>Try another search or add cards from a study deck.</Text></View> : filtered.map(({ card, deck }, index) => <FadeIn key={card.id} delay={Math.min(index * 18, 180)}><ScalePress onPress={() => setSelected(card)} style={s.cardRow}><View style={[s.cardMark, { backgroundColor: deck.accent }]} /><View style={s.cardCopy}><Text style={s.deckLabel}>{deck.name.toUpperCase()}</Text><Text style={s.front} numberOfLines={2}>{card.front}</Text><Text style={s.back} numberOfLines={1}>{card.back}</Text>{card.tags.length > 0 && <Text style={s.tags}>#{card.tags.slice(0, 3).join('  #')}</Text>}</View><Text style={s.chevron}>›</Text></ScalePress></FadeIn>)}

    <CardActions card={selected} deck={decks.find(d => d.id === selected?.deckId)} onClose={() => setSelected(null)} onToggleSuspend={onToggleSuspend} onDelete={onDelete} />
  </ScrollView>;
}

function CardActions({ card, deck, onClose, onToggleSuspend, onDelete }: { card: Card | null; deck?: Deck; onClose: () => void; onToggleSuspend: (id: string) => Promise<void>; onDelete: (id: string) => Promise<void> }) {
  if (!card) return null;
  return <Modal visible transparent animationType="slide" onRequestClose={onClose}>
    <View style={s.backdrop}><View style={s.sheet}><View style={s.handle}/><View style={s.modalHead}><View><Text style={s.modalEyebrow}>{deck?.name?.toUpperCase() || 'CARD'}</Text><Text style={s.modalTitle}>Card details</Text></View><Pressable onPress={onClose}><Text style={s.close}>×</Text></Pressable></View>
      <Text style={s.detailLabel}>FRONT</Text><Text style={s.detail}>{card.front}</Text>
      <Text style={s.detailLabel}>BACK</Text><Text style={s.detail}>{card.back}</Text>
      {card.tags.length > 0 && <Text style={s.detailTags}>#{card.tags.join('  #')}</Text>}
      <Button label={card.suspended ? 'Unsuspend card' : 'Suspend card'} secondary onPress={async () => { await onToggleSuspend(card.id); onClose(); }} />
      <Pressable style={s.deleteButton} onPress={async () => { await onDelete(card.id); onClose(); }}><Text style={s.deleteText}>Delete card</Text></Pressable>
    </View></View>
  </Modal>;
}

const s = StyleSheet.create({
  scroll:{padding:20,paddingBottom:48},
  importHero:{backgroundColor:T.colors.dark,borderRadius:28,padding:21,marginBottom:28},
  badge:{alignSelf:'flex-start',paddingHorizontal:9,paddingVertical:5,borderRadius:9,backgroundColor:'#37333F'},
  badgeText:{fontSize:8,fontWeight:'900',letterSpacing:1.3,color:'#C9C4D2'},
  importTitle:{fontSize:25,fontWeight:'900',letterSpacing:-.7,color:'#FFF',marginTop:15},
  importText:{fontSize:12,lineHeight:19,color:'#BDB8C8',marginTop:7,marginBottom:17},
  sectionHead:{marginBottom:11},
  sectionTitle:{fontSize:18,fontWeight:'900',color:T.colors.ink},
  sectionMeta:{fontSize:11,color:T.colors.muted,marginTop:2},
  search:{height:50,borderRadius:16,borderWidth:1,borderColor:T.colors.line,backgroundColor:T.colors.surface,flexDirection:'row',alignItems:'center',paddingHorizontal:14},
  searchIcon:{fontSize:22,color:T.colors.muted,marginRight:8},
  searchInput:{flex:1,color:T.colors.ink,fontSize:13},
  filters:{flexDirection:'row',gap:8,marginVertical:13},
  filter:{paddingHorizontal:13,paddingVertical:8,borderRadius:12,borderWidth:1,borderColor:T.colors.line,backgroundColor:T.colors.surface},
  filterActive:{backgroundColor:T.colors.ink,borderColor:T.colors.ink},
  filterText:{fontSize:10,fontWeight:'800',color:T.colors.muted},
  filterTextActive:{color:'#FFF'},
  cardRow:{backgroundColor:T.colors.surface,borderRadius:19,borderWidth:1,borderColor:T.colors.line,padding:14,flexDirection:'row',alignItems:'stretch',marginBottom:9},
  cardMark:{width:4,borderRadius:4,marginRight:12},
  cardCopy:{flex:1},
  deckLabel:{fontSize:8,fontWeight:'900',letterSpacing:1.2,color:T.colors.faint,marginBottom:5},
  front:{fontSize:15,fontWeight:'800',lineHeight:20,color:T.colors.ink},
  back:{fontSize:11,lineHeight:17,color:T.colors.muted,marginTop:3},
  tags:{fontSize:9,fontWeight:'700',color:T.colors.accent,marginTop:7},
  chevron:{fontSize:24,color:T.colors.faint,alignSelf:'center',marginLeft:8},
  empty:{borderRadius:22,borderWidth:1,borderColor:T.colors.line,padding:28,alignItems:'center',marginTop:5},
  emptyTitle:{fontSize:16,fontWeight:'900',color:T.colors.ink},
  emptyText:{fontSize:11,color:T.colors.muted,textAlign:'center',marginTop:5},
  backdrop:{flex:1,justifyContent:'flex-end',backgroundColor:'rgba(20,18,24,0.45)'},
  sheet:{backgroundColor:T.colors.bg,borderTopLeftRadius:28,borderTopRightRadius:28,padding:20,paddingBottom:30},
  handle:{width:36,height:4,borderRadius:4,backgroundColor:'#D0CCC7',alignSelf:'center',marginBottom:18},
  modalHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  modalEyebrow:{fontSize:8,fontWeight:'900',letterSpacing:1.4,color:T.colors.accent},
  modalTitle:{fontSize:23,fontWeight:'900',color:T.colors.ink,marginTop:3},
  close:{fontSize:28,color:T.colors.muted},
  detailLabel:{fontSize:8,fontWeight:'900',letterSpacing:1.2,color:T.colors.faint,marginTop:20,marginBottom:6},
  detail:{fontSize:14,lineHeight:21,color:T.colors.ink},
  detailTags:{fontSize:10,fontWeight:'800',color:T.colors.accent,marginTop:12,marginBottom:2},
  deleteButton:{height:48,alignItems:'center',justifyContent:'center',marginTop:8},
  deleteText:{fontSize:12,fontWeight:'800',color:'#B04A43'}
});
