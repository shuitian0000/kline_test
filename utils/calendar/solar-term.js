// 24节气常数（分钟偏移）
const TERM_INFO = [
  0, 21208, 42467, 63836, 85337, 107014,
  128867, 150921, 173149, 195551, 218072,
  240693, 263343, 285989, 308563, 331033,
  353350, 375494, 397447, 419210, 440795,
  462224, 483532, 504758
];

const BASE = Date.UTC(1900, 0, 6, 2, 5);

export function getSolarTerm(year, index) {
  const offset = 31556925974.7 * (year - 1900) + TERM_INFO[index] * 60000;
  return new Date(BASE + offset);
}
