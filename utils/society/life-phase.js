// 人生阶段风险调制
export function lifePhaseFactor(age) {
  if (age < 25) return 1.15;   // 试错期
  if (age < 40) return 1.0;    // 成长期
  if (age < 55) return 0.9;    // 稳定期
  return 1.05;                // 风险回升期
}
