// 页面调用入口
// Explain Adapter（页面只调用这一层）

import { buildExplain } from './explain-engine'

export async function explain(point) {
  return buildExplain({
    age: point.age,
    year: point.year,
    value: point.value,
    bzFactor: point.bz,
    socFactor: point.soc,
    phaseFactor: point.phase
  })
}
