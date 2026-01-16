// yongshen.js（结构偏向，冻结）

export function calcYongshen(weight) {
  let max = null
  let min = null

  Object.keys(weight).forEach(k => {
    if (!max || weight[k] > weight[max]) max = k
    if (!min || weight[k] < weight[min]) min = k
  })

  return {
    dominant: max,
    deficient: min
  }
}
