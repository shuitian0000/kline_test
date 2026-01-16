// wuxing-weight.js（权重计算，冻结）

export function calcWuxingWeight(wuxing) {
  const weight = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0
  }

  weight[wuxing.gan] += 1.2
  weight[wuxing.zhi] += 1.0

  const total = Object.values(weight).reduce((a, b) => a + b, 0)

  Object.keys(weight).forEach(k => {
    weight[k] = weight[k] / total
  })

  return weight
}
