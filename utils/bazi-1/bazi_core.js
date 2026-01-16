// bazi_core.js（八字排盘核心）
// 注意
// 这是工程可控版
// 精准天文算法 👉 可放到后端再升级

import { getYearGanZhi } from './calendar'
import { TIANGAN, DIZHI } from './ganzhi'

export function getBaZi(input) {
  const { year, month, day, hour } = input

  const yearGZ = getYearGanZhi(year)

  // ⚠️ 简化版月/日/时柱（端侧可跑）
  const monthGZ = {
    gan: TIANGAN[(year * month) % 10],
    zhi: DIZHI[month % 12]
  }

  const dayGZ = {
    gan: TIANGAN[(year + month + day) % 10],
    zhi: DIZHI[day % 12]
  }

  const hourGZ = {
    gan: TIANGAN[(day + hour) % 10],
    zhi: DIZHI[Math.floor(hour / 2) % 12]
  }

  return {
    year: yearGZ,
    month: monthGZ,
    day: dayGZ,
    hour: hourGZ,
    dayMaster: dayGZ.gan
  }
}
