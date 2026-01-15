// 数值→语义

export function scoreLevel(v) {
  if (v < 0.7) return "低位"
  if (v < 0.9) return "偏弱"
  if (v < 1.1) return "平稳"
  if (v < 1.3) return "偏强"
  return "高位"
}

export function dominantFactor({ bz, soc, phase }) {
  const map = { bz, soc, phase }
  return Object.keys(map).reduce((a,b)=> map[a]>map[b]?a:b)
}

const FACTOR_TEXT = {
  bz: "个人能力与内在状态",
  soc: "外部环境与时代变量",
  phase: "年龄阶段与角色变化"
}
