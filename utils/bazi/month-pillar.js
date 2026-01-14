// month-pillar.js
import { TIAN_GAN, DI_ZHI } from './ganzhi';

const MONTH_BRANCH = ['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'];

export function getMonthPillar(yearStem, monthIndex) {
  const stemIndex = (TIAN_GAN.indexOf(yearStem) * 2 + monthIndex) % 10;
  return TIAN_GAN[stemIndex] + MONTH_BRANCH[monthIndex];
}
