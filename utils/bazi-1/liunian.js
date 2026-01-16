// liunian.js（年度扰动，冻结）

export function calcLiunian(year) {
  const noise = Math.sin(year * 0.13)
  return {
    delta: noise * 0.1
  }
}
