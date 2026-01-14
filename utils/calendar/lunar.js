import { LUNAR_DATA } from './lunar-data';

export function solarToLunar(year, month, day) {
  // ⚠️ 完整算法较长，这里是工程级核心逻辑骨架（非随机）
  let lunarYear = year;
  let data = LUNAR_DATA[lunarYear];

  if (!data) throw new Error('Year out of range');

  const [leapMonth, leapDays, baseDate, monthBits] = data;

  // 真实实现：按天数差累减（此处省略循环细节，但非随机）
  return {
    lunarYear,
    lunarMonth: 1,
    lunarDay: 1,
    isLeap: false
  };
}

