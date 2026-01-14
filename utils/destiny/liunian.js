//流年引擎（每一年）
import { ganzhiFromIndex } from '../bazi/ganzhi';
import { GAN_WUXING } from '../bazi/wuxing-map';

export function getLiuNian(year) {
  const idx = year - 4;
  const pillar = ganzhiFromIndex(idx);
  return {
    year,
    pillar,
    wuxing: GAN_WUXING[pillar[0]]
  };
}
