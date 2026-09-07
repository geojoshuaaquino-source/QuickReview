import { Card, Deck, makeId, now } from './models';

const t=now();
const card=(deckId:string,front:string,back:string,examples:string[]=[]):Card=>({id:makeId('card'),deckId,type:'basic',front,back,examples,tags:[],createdAt:t,updatedAt:t,suspended:false});

export const starterDecks:Deck[]=[
 {id:'biology',name:'Biology',subject:'Cell biology · Chapter 1–4',accent:'#6557E8',createdAt:t,updatedAt:t,cards:[]},
 {id:'platform',name:'Platform Technology',subject:'IT fundamentals',accent:'#2E8A67',createdAt:t,updatedAt:t,cards:[]},
 {id:'japanese',name:'Japanese Vocabulary',subject:'N5 · Core words',accent:'#D66A4C',createdAt:t,updatedAt:t,cards:[]}
];
starterDecks[0].cards=[
 card('biology','What is the primary function of mitochondria?','They produce ATP, the cell’s main usable energy source, through cellular respiration.',['Muscle cells contain many mitochondria because they have high energy demands.']),
 card('biology','What is the role of the cell membrane?','It regulates what enters and leaves the cell and helps maintain homeostasis.',['Transport proteins in the membrane help move specific substances across it.']),
 card('biology','Where does glycolysis occur?','In the cytoplasm of the cell.',['Glycolysis breaks glucose into pyruvate before later stages of cellular respiration.'])
];
starterDecks[1].cards=[
 card('platform','What does an operating system do?','It manages hardware and provides services and an environment for applications.',['Windows, Linux, Android, and macOS are examples of operating systems.']),
 card('platform','What is RAM?','Volatile memory used to hold data and instructions currently being worked on.',['RAM is cleared when the device loses power, unlike persistent storage such as an SSD.'])
];
starterDecks[2].cards=[
 card('japanese','水（みず）','water',['水を飲みます。 — I drink water.']),
 card('japanese','学校（がっこう）','school',['学校へ行きます。 — I go to school.']),
 card('japanese','先生（せんせい）','teacher',['先生に聞きます。 — I ask the teacher.'])
];
