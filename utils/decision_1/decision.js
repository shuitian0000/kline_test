import { TEMPLATES } from './templates'
import { checkPremiumAccess } from '../payment'

/**
 * 可行到决策工具
 * @param {Object[]} klineData - K 线数组 [{year, evolve, societyTrend}]
 * @param {Object} user - 用户信息
 * @returns {Object[]} 每年可行动作与建议
 */
export function generateDecisions(klineData, user) {
  return klineData.map(point => {
    const { evolve, societyTrend } = point

    // 基础可行动作列表
    let actions = []
    if (evolve.score > 0.7) {
      actions.push('抓住机会学习/投资')
      actions.push('尝试挑战新项目')
    } else if (evolve.score < 0.3) {
      actions.push('降低风险，稳步推进')
      actions.push('休整与总结经验')
    } else {
      actions.push('维持现有节奏')
      actions.push('小幅优化当前计划')
    }

    // 社会环境提示
    if (societyTrend.includes('波动')) actions.push('注意社会环境变化')

    // 高级决策（仅会员可见）
    let advancedAdvice = ''
    if (checkPremiumAccess(user, 'decisionTool')) {
      if (evolve.score > 0.8) advancedAdvice = '建议尝试跨领域发展，积累战略资源'
      else if (evolve.score < 0.2) advancedAdvice = '建议降低杠杆风险，避免大决策'
      else advancedAdvice = '适合稳健尝试新策略'
    } else {
      advancedAdvice = '开通会员可查看高级决策建议'
    }

    return {
      year: point.year,
      actions,
      advancedAdvice
    }
  })
}
