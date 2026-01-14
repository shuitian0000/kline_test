// 社会周期总入口

import { macroVolatility } from './macro-cycle';
import { lifePhaseFactor } from './life-phase';

export function getSocietyContext({ year, age }) {
  const macro = macroVolatility(year);
  const life = lifePhaseFactor(age);

  return {
    volatility: macro * life,
    macro,
    life
  };
}

