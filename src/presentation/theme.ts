export const theme={
  colors:{bg:'#F6F7F2',surface:'#FFFFFF',surface2:'#ECEFE7',ink:'#101512',muted:'#5F6862',faint:'#8A948D',line:'#D9DED8',accent:'#B8D63D',accentInk:'#182000',dark:'#121613',darkMuted:'#AEB7AF',success:'#3E8F68',successSoft:'#E2F0E8',danger:'#C94D4D',dangerSoft:'#F8E4E4',white:'#FFFFFF',black:'#000000'},
  radius:{sm:8,md:12,lg:16,xl:22,pill:999},
  space:{xs:4,sm:8,md:12,lg:16,xl:24,xxl:32,huge:48},
  typography:{display:34,title:26,heading:19,body:15,meta:12,caption:10},
  motion:{micro:120,fast:180,standard:240,enter:280,pressScale:.975}
} as const;
export type Theme=typeof theme;
