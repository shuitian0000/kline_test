// 年度 → K 线映射（金融级约束）
export function yearToKline(prevClose, score) {
  const open = prevClose;
  const close = open * score;

  const high = Math.max(open, close) * 1.05;
  const low  = Math.min(open, close) * 0.95;

  return { open, close, high, low };
}
