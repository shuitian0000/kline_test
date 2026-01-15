// 总决策输出（今天做）

import { calcXiJi } from './xi-ji-engine'
import { INDUSTRY_MAP } from './industry-map'
import { ACTION_MAP } from './action-map'

export function buildDecision({ wuxingMap, level }) {
  const { xi, ji } = calcXiJi(wuxingMap)

  const recommendIndustries = xi.flatMap(x => INDUSTRY_MAP[x])
  const avoidIndustries = ji.flatMap(x => INDUSTRY_MAP[x])

  const mainAction = ACTION_MAP[xi[0]]
  const riskAction = ACTION_MAP[ji[0]]

  return {
    focus: xi,
    caution: ji,

    industries: {
      recommend: recommendIndustries.slice(0,4),
      avoid: avoidIndustries.slice(0,3)
    },

    action: {
      strategy: mainAction.strategy,
      do: mainAction.do,
      avoid: riskAction.do
    },

    note:
      level === '高位'
        ? "顺势可放大，但需防止过度扩张"
        : level === '低位'
        ? "优先防守，避免高风险选择"
        : "以稳健推进为主"
  }
}
