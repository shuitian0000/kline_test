// calendar.js（节气 / 年柱基础）
// ⚠️
// 月柱精确节气法 可后续升级，这里是端侧可跑版本

// export function getYearGanZhi(year) {
//   const gan = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
//   const zhi = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']
//   return {
//     gan: gan[(year - 4) % 10],
//     zhi: zhi[(year - 4) % 12]
//   }
// }

/**
 * 时间映射工具
 * 不涉及预测，仅做周期索引
 */

export function solarYearToIndex(year) {
  return (year - 4) % 60
}

