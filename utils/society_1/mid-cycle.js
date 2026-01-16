
import { SOCIETY_PHASE } from './constants'

export function calcMidCycle(year) {
  const cycleLength = 10
  const pos = year % cycleLength

  if (pos < 3) return { phase: SOCIETY_PHASE.RECOVERY, factor: 0.95 }
  if (pos < 6) return { phase: SOCIETY_PHASE.EXPANSION, factor: 1.05 }
  if (pos < 8) return { phase: SOCIETY_PHASE.PEAK, factor: 1.0 }
  return { phase: SOCIETY_PHASE.CONTRACTION, factor: 0.9 }
}
