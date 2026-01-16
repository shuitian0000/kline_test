// long-cycle.js（类似康波，但不明说）

import { SOCIETY_PHASE } from './constants'

export function calcLongCycle(year) {
  const cycleLength = 60
  const pos = (year - 1900) % cycleLength

  if (pos < 15) return { phase: SOCIETY_PHASE.RECOVERY, factor: 0.9 }
  if (pos < 30) return { phase: SOCIETY_PHASE.EXPANSION, factor: 1.1 }
  if (pos < 45) return { phase: SOCIETY_PHASE.PEAK, factor: 1.0 }
  return { phase: SOCIETY_PHASE.CONTRACTION, factor: 0.8 }
}
