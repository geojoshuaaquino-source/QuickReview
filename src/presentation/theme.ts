export const theme={
  colors:{bg:'#F4F0E7',surface:'#FBF9F3',surface2:'#E9E3D8',ink:'#171614',muted:'#6E6A61',faint:'#9A9489',line:'#D8D1C4',accent:'#D9573F',accentSoft:'#F4DDD5',green:'#2E765D',greenSoft:'#DDEAE3',red:'#B84A43',redSoft:'#F1DEDB',purple:'#6258A7',purpleSoft:'#E6E2F1',cyan:'#28757A',dark:'#20201C',white:'#FFFDF8'},
  radius:{sm:8,md:12,lg:16,xl:22,pill:999},
  space:{xs:4,sm:8,md:12,lg:16,xl:24,xxl:32,huge:40}
} as const;
export type Theme=typeof theme;
