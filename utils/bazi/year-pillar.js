//年柱（以立春为界）
// year-pillar.js
import { ganzhiFromIndex } from './ganzhi';

export function getYearPillar(year, afterLichun) {
  const base = year - 4;
  const idx = afterLichun ? base : base - 1;
  return ganzhiFromIndex(idx);
}
