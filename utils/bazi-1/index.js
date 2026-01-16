// 模块统一出口（给其他模块用）
// 📌 设计要点
// 对外永远只暴露 结构化对象
// 不在 bazi 层输出任何“好/坏”文字

// import { getBaZi } from './bazi_core'
// import { calcShiShen } from './shishen'
// import { calcWuXingBalance } from './wuxing'
// import { calcDaYun } from './dayun'
// import { calcLiuNian } from './liunian'
// import { calcBaZiScore } from './score'

// export function calcBaZiProfile(input) {
//   const bazi = getBaZi(input)
//   const shishen = calcShiShen(bazi)
//   const wuxing = calcWuXingBalance(bazi)
//   const dayun = calcDaYun(bazi, input.gender)
//   const score = calcBaZiScore({ bazi, shishen, wuxing })

//   return {
//     bazi,
//     shishen,
//     wuxing,
//     dayun,
//     score
//   }
// }

// export function calcYearEffect(profile, year) {
//   const liunian = calcLiuNian(profile.bazi, year)
//   return {
//     year,
//     liunian,
//     impactScore: profile.score.base + liunian.delta
//   }
// }


import { calcDayPillar } from './day-pillar'
import { calcWuxing } from './wuxing'
import { calcWuxingWeight } from './wuxing-weight'
import { calcYongshen } from './yongshen'
import { calcStructureScore } from './structure-score'
import { calcDayun } from './dayun'
import { calcLiunian } from './liunian'

export function buildBaziProfile(input) {
  const dayPillar = calcDayPillar(input)
  const wuxing = calcWuxing(dayPillar)
  const wuxingWeight = calcWuxingWeight(wuxing)
  const yongshen = calcYongshen(wuxingWeight)
  const structureScore = calcStructureScore(wuxingWeight, yongshen)
  const dayun = calcDayun(dayPillar, structureScore)

  return {
    dayPillar,
    wuxing,
    wuxingWeight,
    yongshen,
    structureScore,
    dayun
  }
}

export { calcLiunian }
