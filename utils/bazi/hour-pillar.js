// hour-pillar.js
import { TIAN_GAN, DI_ZHI } from './ganzhi';

export function getHourPillar(dayStem, hour) {
  const branchIndex = Math.floor((hour + 1) / 2) % 12;
  const stemIndex = (TIAN_GAN.indexOf(dayStem) * 2 + branchIndex) % 10;
  return TIAN_GAN[stemIndex] + DI_ZHI[branchIndex];
}
