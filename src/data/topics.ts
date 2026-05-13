import type { Topic } from '../types';

export const TOPICS: Topic[] = [
  { id:'daily-life',    korean:'일상 생활',  english:'Daily Life',        icon:'☀️', chips:['routine','habits','weekend','sleep'] },
  { id:'food',          korean:'음식',       english:'Food',              icon:'🍜', chips:['restaurants','cooking','taste','diet'] },
  { id:'travel',        korean:'여행',       english:'Travel',            icon:'✈️', chips:['places','memories','plans','problems'] },
  { id:'relationships', korean:'인간관계',   english:'Relationships',     icon:'🤝', chips:['friends','family','feelings','conflict'] },
  { id:'work-study',    korean:'일/공부',    english:'Work / Study',      icon:'💼', chips:['class','tasks','interview','stress'] },
  { id:'living-korea',  korean:'한국 생활',  english:'Living in Korea',   icon:'🏘️', chips:['transport','housing','culture','language'] },
  { id:'health',        korean:'건강',       english:'Health',            icon:'🏃', chips:['exercise','stress','sickness','sleep'] },
  { id:'future',        korean:'미래 계획',  english:'Future Goals',      icon:'🌟', chips:['goals','career','dreams','plans'] },
  { id:'technology',    korean:'기술/SNS',   english:'Tech & Social Media',icon:'📱', chips:['phone','apps','SNS','YouTube'] },
];
