import { calcLongCycle } from './long-cycle'
import { calcMidCycle } from './mid-cycle'
import { calcShortCycle } from './short-cycle'
import { mergeSocietyImpact } from './society-impact'

export function calcSocietyFactor(year) {
  const longCycle = calcLongCycle(year)
  const midCycle = calcMidCycle(year)
  const shortCycle = calcShortCycle(year)

  return mergeSocietyImpact(longCycle, midCycle, shortCycle)
}
