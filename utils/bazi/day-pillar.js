// day-pillar.js
import { ganzhiFromIndex } from './ganzhi';

export function getDayPillar(date) {
  const base = new Date(1900,0,31); // 庚子日
  const diff = Math.floor((date - base) / 86400000);
  return ganzhiFromIndex(diff);
}
