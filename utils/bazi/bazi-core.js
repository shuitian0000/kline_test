//八字核心引擎（真正可用）
import { getYearPillar } from './year-pillar';
import { getMonthPillar } from './month-pillar';
import { getDayPillar } from './day-pillar';
import { getHourPillar } from './hour-pillar';
import { calcWuxing } from './wuxing-engine';
import { analyzeStrength, getYongShen } from './yongshen';
import { GAN_WUXING } from './wuxing-map';

export function getBazi({date, hour, afterLichun}) {
  const year = getYearPillar(date.getFullYear(), afterLichun);
  const month = getMonthPillar(year[0], date.getMonth());
  const day = getDayPillar(date);
  const hourP = getHourPillar(day[0], hour);

  const pillars = [year, month, day, hourP];
  const wuxing = calcWuxing(pillars);
  const strength = analyzeStrength(wuxing, GAN_WUXING[day[0]]);
  const yongshen = getYongShen(wuxing, strength);

  return {pillars, wuxing, strength, yongshen};
}

