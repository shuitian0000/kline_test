export function buildOHLC(series) {
  const result = []

  for (let i = 1; i < series.length; i++) {
    const prev = series[i - 1]
    const curr = series[i]

    const open = prev.value
    const close = curr.value

    const high = Math.max(open, close) * (1 + Math.random() * 0.05)
    const low = Math.min(open, close) * (1 - Math.random() * 0.05)

    result.push({
      year: curr.year,
      age: curr.age,
      open,
      high,
      low,
      close
    })
  }

  return result
}
