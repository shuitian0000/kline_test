export function mergeSocietyImpact(longC, midC, shortC) {
  const factor =
    longC.factor * 0.5 +
    midC.factor * 0.3 +
    shortC.factor * 0.2

  return {
    factor,
    detail: {
      long: longC,
      mid: midC,
      short: shortC
    }
  }
}
