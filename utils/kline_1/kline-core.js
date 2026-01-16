// kline-core.js（核心融合）

import { mapYearAge } from './year-mapper'
import { buildOHLC } from './ohlc-builder'
import { normalizeSeries } from './normalize'
import { calcLiunian } from '../bazi/liunian'
import { calcSocietyFactor } from '../society'

export function buildKlineData(profile, options) {
  const {
    birthYear,
    startAge = 10,
    endAge = 80
  } = options

  const years = mapYearAge(birthYear, startAge, endAge)
  const raw = []

  years.forEach(y => {
    const liunian = calcLiunian(y.year)
    const society = calcSocietyFactor(y.year)

    const base =
      profile.structureScore.stability * 100

    const value =
      base *
      (1 + liunian.delta) *
      society.factor

    raw.push({
      year: y.year,
      age: y.age,
      value
    })
  })

  return normalizeSeries(
    buildOHLC(raw)
  )
}
