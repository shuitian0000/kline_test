//年度运势评分（去玄学，纯模型）
export function calcYearScore({
  base,         // 本命基础
  dayunScore,   // 大运影响
  liunian,      // 流年
  yongshen
}) {
  let score = base;

  score *= dayunScore;

  if (liunian.wuxing === yongshen) score *= 1.15;
  else score *= 0.95;

  return Math.max(0.1, Math.min(score, 2));
}
