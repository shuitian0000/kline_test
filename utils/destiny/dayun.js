//大运引擎（10 年一运）
// 大运干支推进规则
// 阳男 / 阴女：顺行
// 阴男 / 阳女：逆行

import { TIAN_GAN, DI_ZHI } from '../bazi/ganzhi';

export function getDaYunPillars(monthPillar, count, forward=true) {
  const ganIndex = TIAN_GAN.indexOf(monthPillar[0]);
  const zhiIndex = DI_ZHI.indexOf(monthPillar[1]);

  const list = [];
  for (let i = 1; i <= count; i++) {
    const gi = (ganIndex + (forward ? i : -i) + 10) % 10;
    const zi = (zhiIndex + (forward ? i : -i) + 12) % 12;
    list.push(TIAN_GAN[gi] + DI_ZHI[zi]);
  }
  return list;
}

