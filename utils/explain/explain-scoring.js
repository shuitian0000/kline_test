// 数值→语义

export function scoreLevel(v) {
  if (v < 0.7) return "低位"
  if (v < 0.9) return "偏弱"
  if (v < 1.1) return "平稳"
  if (v < 1.3) return "偏强"
  return "高位"
}
