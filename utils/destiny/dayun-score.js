//大运五行评分
// dayun-score.js
import { GAN_WUXING } from '../bazi/wuxing-map';

export function scoreDaYun(dayunPillar, yongshen) {
  const wuxing = GAN_WUXING[dayunPillar[0]];
  return wuxing === yongshen ? 1.2 : 0.8;
}
