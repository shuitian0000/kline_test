// utils/destiny/society.js

/**
 * 获取某个年龄阶段的宏观社会周期影响
 * 这里可以用简化模型：历史周期 + 年龄权重
 */
export function getSocietyContext(stage) {
  // 模拟社会周期，取值 0~1 表示波动幅度
  let volatility = 0.1 + Math.sin(stage.ageMid / 10) * 0.05
  return { volatility: parseFloat(volatility.toFixed(2)) }
}
