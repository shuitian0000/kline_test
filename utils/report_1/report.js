import { TEMPLATES } from './templates'
import { generateEvolutionExplanation } from '../evolve'
import { TEMPLATES as EXPLAIN_TEMPLATES } from '../explain'

/**
 * 生成年度报告
 * @param {Object[]} klineData - K线数组 [{year, open, close, high, low, explanation, evolve}]
 * @param {Object} profile - 用户信息 {birthYear, name, ...}
 * @returns {Object} 年度报告
 */
export function generateAnnualReport(klineData, profile) {
  const report = []

  klineData.forEach(point => {
    // 原始解释
    const { explanation } = point

    // 进化解释
    const evolveExplanation = generateEvolutionExplanation(point.evolve)

    // 社会周期趋势
    const socialTrend = point.societyScore || 0.5
    let societyText = ''
    if (socialTrend > 0.7) societyText = '社会环境稳定，有利发展'
    else if (socialTrend < 0.3) societyText = '社会波动较大，需谨慎'
    else societyText = '社会环境平稳，可稳步推进'

    report.push({
      year: point.year,
      originalExplanation: explanation,
      evolve: point.evolve,
      evolveExplanation,
      societyTrend: societyText
    })
  })

  // 汇总分析
  const highEvolveYears = report.filter(r => r.evolve.score > 0.7).map(r => r.year)
  const lowEvolveYears = report.filter(r => r.evolve.score < 0.3).map(r => r.year)

  return {
    user: profile,
    yearlyReport: report,
    summary: {
      highGrowthYears: highEvolveYears,
      lowGrowthYears: lowEvolveYears,
      advice: '合理安排关键年份，抓住高成长期机会，稳健度过低迷期'
    }
  }
}
