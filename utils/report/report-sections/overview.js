// 年度环境概览占位
// 年度环境概览（overview）

// 输入
// 社会周期因子（全年均值）
// 波动幅度（max-min）

// 逻辑
// 判断：上行 / 平稳 / 承压
// 判断：波动高 / 中 / 低

export function buildOverview({ socAvg, socVol }) {
  return `
从整体环境看，本年度外部周期处于${socAvg > 1.1 ? '相对有利' : socAvg < 0.9 ? '承压' : '中性'}区间，
整体波动水平为${socVol > 0.3 ? '偏高' : socVol < 0.15 ? '较低' : '中等'}。

在此背景下，更适合采取${socAvg > 1 ? '顺势而为' : '稳健应对'}的策略。
`
}
