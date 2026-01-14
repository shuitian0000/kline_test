// 人生 K 线总引擎（最重要）
import { getDaYunPillars } from '../destiny/dayun';
import { scoreDaYun } from '../destiny/dayun-score';
import { getLiuNian } from '../destiny/liunian';
import { calcYearScore } from '../destiny/year-score';
import { yearToKline } from './kline-math';

export function generateLifeKline({
  bazi,
  birthYear,
  qiYunAge,
  gender
}) {
  const forward =
    (gender === 'male' && bazi.pillars[0][0] % 2 === 0) ||
    (gender === 'female' && bazi.pillars[0][0] % 2 !== 0);

  const dayuns = getDaYunPillars(bazi.pillars[1], 8, forward);

  let age = qiYunAge;
  let year = birthYear + qiYunAge;
  let prevClose = 1;

  const result = [];

  dayuns.forEach(dy => {
    const dyScore = scoreDaYun(dy, bazi.yongshen);

    for (let i = 0; i < 10; i++) {
      const ln = getLiuNian(year);
      const score = calcYearScore({
        base: 1,
        dayunScore: dyScore,
        liunian: ln,
        yongshen: bazi.yongshen
      });

      const k = yearToKline(prevClose, score);

      result.push({
        age,
        year,
        dayun: dy,
        liunian: ln.pillar,
        ...k
      });

      prevClose = k.close;
      age++;
      year++;
    }
  });

  return result;
}

