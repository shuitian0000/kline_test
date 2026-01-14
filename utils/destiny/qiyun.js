//起运计算（非常关键）
/**
 * 起运计算
 * 出生到下一节气的天数 ÷ 3 = 起运岁数
 */
export function calcQiYun(birthDate, nextSolarTermDate) {
  const diffDays = Math.abs(
    (nextSolarTermDate - birthDate) / 86400000
  );
  return Math.floor(diffDays / 3);
}
