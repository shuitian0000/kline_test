// dayun.js（人生阶段趋势，冻结）

export function calcDayun(dayPillar, score) {
  const result = []

  for (let i = 0; i < 8; i++) {
    result.push({
      fromAge: 10 + i * 10,
      toAge: 10 + i * 10 + 9,
      trend: score.stability + (i - 3) * 0.05
    })
  }

  return result
}
