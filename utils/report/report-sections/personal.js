// 个人结构分析占位，个人结构分析（personal）
// 输入：
// 八字因子均值
// 阶段因子
// 喜忌五行

export function buildPersonal({ bzAvg, phase, xi, ji }) {
  return `
从个人结构看，目前处于${phase > 1 ? '能力释放阶段' : '调整积累阶段'}。
相对有利的要素集中在${xi.join('、')}，需要注意避免${ji.join('、')}相关的过度消耗。

整体而言，个人状态与环境的匹配度为${bzAvg > 1 ? '良好' : '一般'}。
`
}
