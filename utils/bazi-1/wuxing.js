// wuxing.js（五行平衡）

// import { GAN_WUXING, ZHI_WUXING } from './ganzhi'

// export function calcWuXingBalance(bazi) {
//   const count = { 木:0, 火:0, 土:0, 金:0, 水:0 }

//   Object.values(bazi).forEach(col => {
//     if (col.gan) count[GAN_WUXING[col.gan]]++
//     if (col.zhi) count[ZHI_WUXING[col.zhi]]++
//   })

//   return count
// }

// wuxing.js（五行关系，冻结）

export function calcWuxing(dayPillar) {
  return {
    gan: dayPillar.gan.wuxing,
    zhi: dayPillar.zhi.wuxing
  }
}

