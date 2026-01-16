export function calcShortCycle(year) {
  const noise = Math.sin(year * 0.37)
  return {
    factor: 1 + noise * 0.05
  }
}
