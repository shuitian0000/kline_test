import { TEMPLATES } from './templates'

/**
 * 根据 K 线点位数据生成解释文本
 * @param {Object} point - K 线点位对象
 * @returns {Object} explanation
 */
export function generateExplanation(point) {
  const { close } = point
  let category = ''
  if (close > 0.7) {
    category = 'stable'
  } else if (close < 0.3) {
    category = 'volatile'
  } else {
    category = 'balanced'
  }

  const template = TEMPLATES[category]

  return {
    text: template.text,
    risk: template.risk,
    advice: template.advice
  }
}
