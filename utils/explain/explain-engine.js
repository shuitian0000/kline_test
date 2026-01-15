// Explain 引擎主逻辑（可直接用）

import { scoreLevel, dominantFactor } from './explain-scoring'
import { SUMMARY, OPPORTUNITY, RISK, ADVICE } from './explain-templates'

export function buildExplain(input) {
  const level = scoreLevel(input.value)
  const dom = dominantFactor({
    bz: input.bzFactor,
    soc: input.socFactor,
    phase: input.phaseFactor
  })

  return {
    level,
    summary: SUMMARY[level],
    opportunity: OPPORTUNITY[dom],
    risk: RISK[dom],
    advice: ADVICE[dom],
    tags: [
      level,
      dom === 'soc' ? '环境驱动' :
      dom === 'bz' ? '能力驱动' : '阶段驱动'
    ]
  }
}


// export function explainYear(point) {
//   const parts = [];

//   parts.push(
//     `${point.age} 岁（${point.year}年）处于当前人生阶段的一个运势节点。`
//   );

//   parts.push(
//     `从个人条件看，该阶段的能量配置更偏向「${point.dayun} 运势结构」。`
//   );

//   if (point.society.volatility > 1) {
//     parts.push(
//       '宏观环境的不确定性相对较高，更适合控制节奏、降低单次决策风险。'
//     );
//   } else {
//     parts.push(
//       '外部环境相对稳定，有利于中长期规划的推进。'
//     );
//   }

//   parts.push(
//     '建议将重点放在可控因素上，避免对短期结果产生过度预期。'
//   );

//   return parts.join('\n');
// }

