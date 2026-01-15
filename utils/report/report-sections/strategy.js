// 年度行动策略
// 年度行动策略（strategy）【最值钱】
// 输入
// Explain 级别
// 决策模块（B）的行动策略

export function buildStrategy({ level, action }) {
  return `
综合趋势判断，本年度适合以「${action.strategy}」作为主线。

建议重点关注：
- ${action.do.join('\n- ')}

同时应避免：
- ${action.avoid.join('\n- ')}

整体节奏上，${level === '高位' ? '可以适度放大动作，但需控制边界' :
  level === '低位' ? '应以防守为主，减少试错成本' :
  '以稳步推进为宜'}。
`
}
