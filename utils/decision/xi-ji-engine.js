// 八字喜忌计算

// {
//   木: 1.2,
//   火: 0.9,
//   土: 0.8,
//   金: 1.1,
//   水: 0.6
// }


function calcXiJi(wuxingMap) {
  const entries = Object.entries(wuxingMap)
  entries.sort((a,b)=>b[1]-a[1])

  return {
    xi: entries.slice(-2).map(e=>e[0]),   // 最弱 → 喜
    ji: entries.slice(0,1).map(e=>e[0])   // 最强 → 忌
  }
}
