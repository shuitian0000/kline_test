// structure-score.js（稳定性评分，冻结）

export function calcStructureScore(weight, yongshen) {
  const values = Object.values(weight)
  const max = Math.max(...values)
  const min = Math.min(...values)

  const balance = 1 - (max - min)
  const stability = Math.max(0.3, balance)
  const volatility = 1 - stability

  return {
    balance,
    stability,
    volatility
  }
}
