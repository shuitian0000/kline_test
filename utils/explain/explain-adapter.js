// 页面调用入口
// Explain Adapter（页面只调用这一层）

// export async function explain(p){
//   return `${p.year}年走势${p.value>0?'上行':'回调'}`
// }

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
