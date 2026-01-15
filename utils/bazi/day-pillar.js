//日柱（六十日循环，确定算法）
// day-pillar.js
import { ganzhiFromIndex } from './ganzhi';

export function getDayPillar(date) {
  const base = new Date(1900,0,31); // 庚子日
  const diff = Math.floor((date - base) / 86400000);
  return ganzhiFromIndex(diff);
}

// function calcDayStrength(bazi) {
//   let score = 1.0
//   score += WUXING_VALUE[bazi.month.dzWuxing] * 0.4
//   score += WUXING_VALUE[bazi.hour.dzWuxing] * 0.2
//   score -= WUXING_VALUE[bazi.year.dzWuxing] * 0.1
//   return clamp(score, 0.6, 1.4)
// }

