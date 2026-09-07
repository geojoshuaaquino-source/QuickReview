export const theme={
  colors:{
    bg:'#F5F1E8',
    surface:'#FFFCF6',
    surface2:'#EEE9DE',
    ink:'#171717',
    muted:'#6D6A63',
    faint:'#9B968C',
    line:'#DDD7CA',
    accent:'#E05A3F',
    accentSoft:'#F8E2DB',
    green:'#2D8667',
    greenSoft:'#DDEEE7',
    red:'#C94B4B',
    redSoft:'#F5DFDF',
    purple:'#685BC7',
    purpleSoft:'#E8E5F7',
    cyan:'#267D87',
    dark:'#1B1C1A'
  },
  radius:{sm:10,md:14,lg:20,xl:28},
  space:{xs:4,sm:8,md:12,lg:16,xl:24,xxl:32}
} as const;
export type Theme=typeof theme;
