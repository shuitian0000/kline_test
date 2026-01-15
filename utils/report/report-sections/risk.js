// 年度行动策略占位

export function buildRisk({ drawdown, socVol }) {
  return `
需要关注的主要风险在于节奏失衡与外部波动叠加。

当出现连续不利变化时，应及时降低投入强度。
整体风险等级评估为：${drawdown > 0.4 || socVol > 0.35 ? '中偏高' : '可控'}。
`
}
