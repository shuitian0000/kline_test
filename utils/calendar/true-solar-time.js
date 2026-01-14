// 经度 → 真太阳时修正
export function toTrueSolarTime(date, longitude) {
  const offsetMinutes = longitude * 4; // 每度 4 分钟
  return new Date(date.getTime() + offsetMinutes * 60000);
}

