export function normalizeSeries(series) {
  const values = series.flatMap(i => [
    i.open, i.high, i.low, i.close
  ])

  const max = Math.max(...values)
  const min = Math.min(...values)

  return series.map(i => ({
    ...i,
    open: (i.open - min) / (max - min),
    high: (i.high - min) / (max - min),
    low: (i.low - min) / (max - min),
    close: (i.close - min) / (max - min)
  }))
}
