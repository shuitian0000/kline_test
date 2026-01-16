// shishen.js（十神结构）
// 📌 不输出“官财吉凶”，只做关系分类

import { GAN_WUXING } from './ganzhi'

export function calcShiShen(bazi) {
  const dm = GAN_WUXING[bazi.dayMaster]

  const result = {}
  Object.values(bazi).forEach(col => {
    if (!col.gan) return
    const wx = GAN_WUXING[col.gan]
    result[col.gan] = wx === dm ? '比劫' : '异类'
  })

  return result
}
