
// 权重微调公式（安全、不会跑飞）


export function adjustWeight(w, feedback) {
  const rate = 0.03        // 学习率（很小）
  const next = w * (1 + rate * feedback)
  return clamp(next, 0.7, 1.3)
}

export function evolveWeights(profile, feedback) {
  profile.weights.bz = adjustWeight(profile.weights.bz, feedback)
  profile.weights.soc = adjustWeight(profile.weights.soc, feedback)
  profile.weights.phase = adjustWeight(profile.weights.phase, feedback)
  return profile
}
