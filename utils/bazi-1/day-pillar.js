// day-pillar.js（日柱 / 日主，冻结）

import { TIANGAN, DIZHI } from './tiangan-dizhi'
import { solarYearToIndex } from './calendar'

export function calcDayPillar({ year }) {
  const index = solarYearToIndex(year)
  return {
    gan: TIANGAN[index % 10],
    zhi: DIZHI[index % 12]
  }
}
