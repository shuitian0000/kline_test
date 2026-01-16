import { TEMPLATES } from './templates'

/**
 * 进化算法
 * @param {Object} point - K线点位 { year, open, close, high, low }
 * @param {Object} profile - 用户八字结构
 * @param {Object} options - 扩展参数
 * @returns {Object} - 进化评分与趋势
 */
export function evolvePoint(point, profile, options = {}) {
  const baseScore = point.close  // 基于 K 线收盘价
  const ageFactor = (point.year - profile.birthYear) / 100
  const socialFactor = options.societyScore || 0.5

  // 综合得分 0~1
  let evolveScore = baseScore * 0.5 + ageFactor * 0.3 + socialFactor * 0.2
  evolveScore = Math.max(0, Math.min(1, evolveScore))

  // 动态趋势
  let trend = ''
  if (evolveScore > 0.7) trend = '高成长期'
  else if (evolveScore < 0.3) trend = '波动期'
  else trend = '平稳期'

  return {
    year: point.year,
    score: evolveScore,
    trend
  }
}

/**
 * 生成进化解释文本
 * @param {Object} evolvePointObj
 * @returns {Object} explanation
 */
export function generateEvolutionExplanation(evolvePointObj) {
  const { trend } = evolvePointObj
  const template = TEMPLATES[trend] || TEMPLATES['平稳期']

  return {
    trend,
    text: template.text,
    advice: template.advice
  }
}
