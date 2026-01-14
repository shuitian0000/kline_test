/**
 * 宏观周期模型
 * 输出的是「不确定性强度」，不是“好坏”
 */
export function macroVolatility(year) {
  const t = year - 1900;

  // 康德拉季耶夫周期（约 55 年）
  const longCycle = Math.sin((2 * Math.PI * t) / 55);

  // 中周期（约 18 年）
  const midCycle = Math.sin((2 * Math.PI * t) / 18);

  return 0.5 + 0.3 * longCycle + 0.2 * midCycle;
}

