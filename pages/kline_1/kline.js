import { buildBaziProfile } from '../../utils/bazi'
import { generateLifeKline } from '../../utils/kline'
import { calcSocietyFactor } from '../../utils/society'

// 新增导入,for evolve
import { evolvePoint, generateEvolutionExplanation } from '../../utils/evolve'
// 新增导入,for payment
import { ensureAccess } from '../../utils/payment'
// 新增导入,for report
import { generateAnnualReport } from '../../utils/report'
// 新增导入,for decision
import { generateDecisions } from '../../utils/decision'


Page({
  data: {
    kline: [],
    currentAge: 30,
    selectedPoint: null
  },

  //for report
  generateReport() {
  const report = generateAnnualReport(this.data.kline, this.data.user)
  wx.setStorageSync('annualReport', report)
  wx.showToast({ title: '年度报告生成成功', icon: 'success' })
  this.setData({ report })
},
  //for decision
  generateDecisionTool() {
  const decisions = generateDecisions(this.data.kline, this.data.user)
  wx.setStorageSync('decisionTool', decisions)
  wx.showToast({ title: '决策工具生成成功', icon: 'success' })
  this.setData({ decisions })
},



  onLoad(query) {
    const year = Number(query.year)
    const profile = buildBaziProfile({ year })

    const cacheKey = `kline_${year}`

   // 尝试从本地缓存读取
    let cached = wx.getStorageSync(cacheKey)
    if (cached && cached.length) {
      this.setData({ kline: cached })
      this.draw()
      return
    }

    // 如果没有缓存，生成
    const profile = buildBaziProfile({ year })
    let kline = generateLifeKline(profile, {
      birthYear: year,
      startAge: 10,
      endAge: 80
    })

    // 为每个点生成解释文本
    kline = kline.map(point => {
      const society = calcSocietyFactor(point.year)
      let text = ''
      let risk = ''
      let advice = ''

      // 简单逻辑示例
      if (point.close > 0.7) {
        text = '结构偏稳定，适合长期规划'
        risk = '高期望年份，注意计划过紧'
        advice = '保持健康生活与持续投入'
      } else if (point.close < 0.3) {
        text = '结构波动较大，需灵活应对'
        risk = '高波动年份，注意财务风险'
        advice = '减少长期承诺，保守投资'
      } else {
        text = '结构均衡，稳中求变'
        risk = '普通年份，注意保持节奏'
        advice = '持续规划，但灵活调整'
      }

    // 新增进化模块,for evolve
    const evolveResult = evolvePoint(point, { birthYear: profile.birthYear }, { societyScore: society })
    const evolveExplanation = generateEvolutionExplanation(evolveResult)

      return {
        ...point,
        explanation: { text, risk, advice },
        evolve: evolveResult,
        evolveExplanation
      }
    })


    // 设置内存数据
    this.setData({ kline })

    // 写入本地缓存
    wx.setStorageSync(cacheKey, kline)

    // 绘制
    this.draw()
  },

  draw() {
  const ctx = wx.createCanvasContext('klineCanvas', this)
  const data = this.data.kline
  const canvasHeight = 400
  const canvasWidth = 360
  const barWidth = 4
  const spacing = 2

  // 清空画布
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  // 循环绘制每个 K 线点
  data.forEach((d, i) => {
    const x = i * (barWidth + spacing) + 10
    const openY = canvasHeight - d.open * canvasHeight
    const closeY = canvasHeight - d.close * canvasHeight
    const highY = canvasHeight - d.high * canvasHeight
    const lowY = canvasHeight - d.low * canvasHeight

    // 颜色判断：上涨为红，下跌为绿
    const color = d.close >= d.open ? '#ff4d4f' : '#4caf50'
    ctx.setStrokeStyle(color)
    ctx.setFillStyle(color)

    // 绘制高低线
    ctx.beginPath()
    ctx.moveTo(x + barWidth / 2, highY)
    ctx.lineTo(x + barWidth / 2, lowY)
    ctx.stroke()

    // 绘制矩形蜡烛实体
    const rectY = Math.min(openY, closeY)
    const rectHeight = Math.abs(openY - closeY)
    ctx.fillRect(x, rectY, barWidth, rectHeight || 1) // 避免高度为0
  })
    ctx.draw()
  },

  // onCanvasTap(e) {
  //   const x = e.detail.x    
  //   const barWidth = 4
  //   const spacing = 2
  //   const index = Math.floor((x - 10) / 5)
  //   if (index >= 0 && index < this.data.kline.length) {
  //     const point = this.data.kline[index]
  //     this.setData({ selectedPoint: point })
  //   }
  // },
//for payment
onCanvasTap(e) {
  const touchX = e.detail.x
  const index = Math.floor((touchX - 10 - this.data.offsetX) / (barWidth + spacing))
  if (index >= 0 && index < this.data.kline.length) {
    const point = this.data.kline[index]

    // 检查是否付费访问 evolve 详情
    const hasAccess = ensureAccess(this.data.user, 'evolveDetail')
    if (hasAccess) {
      this.setData({ selectedPoint: point })
    }
  }
},


  onAgeChange(e) {
    this.setData({ currentAge: e.detail.value })
  },

  openFullscreen() {
    wx.navigateTo({
      url: '/pages/fullscreen/fullscreen'
    })
  }
})



// 二、具体实现思路

// 在 pages/kline/kline.js 内增加 内存缓存和本地缓存

// 缓存 key 规则：kline_<birthYear>

// 打开页面时先检查缓存，如果存在直接使用，否则生成

// 三、pages/kline/kline.js 优化示例
// import { buildBaziProfile } from '../../utils/bazi'
// import { generateLifeKline } from '../../utils/kline'
// import { calcSocietyFactor } from '../../utils/society'

// Page({
//   data: {
//     kline: [],
//     currentAge: 30,
//     selectedPoint: null
//   },

//   onLoad(query) {
//     const year = Number(query.year)
//     const cacheKey = `kline_${year}`

//     // 尝试从本地缓存读取
//     let cached = wx.getStorageSync(cacheKey)
//     if (cached && cached.length) {
//       this.setData({ kline: cached })
//       this.draw()
//       return
//     }

//     // 如果没有缓存，生成
//     const profile = buildBaziProfile({ year })
//     let kline = generateLifeKline(profile, {
//       birthYear: year,
//       startAge: 10,
//       endAge: 80
//     })

//     // 增加解释文本
//     kline = kline.map(point => {
//       const society = calcSocietyFactor(point.year)
//       let text = '', risk = '', advice = ''

//       if (point.close > 0.7) {
//         text = '结构偏稳定，适合长期规划'
//         risk = '高期望年份，注意计划过紧'
//         advice = '保持健康生活与持续投入'
//       } else if (point.close < 0.3) {
//         text = '结构波动较大，需灵活应对'
//         risk = '高波动年份，注意财务风险'
//         advice = '减少长期承诺，保守投资'
//       } else {
//         text = '结构均衡，稳中求变'
//         risk = '普通年份，注意保持节奏'
//         advice = '持续规划，但灵活调整'
//       }

//       return {
//         ...point,
//         explanation: { text, risk, advice }
//       }
//     })

//     // 设置内存数据
//     this.setData({ kline })

//     // 写入本地缓存
//     wx.setStorageSync(cacheKey, kline)

//     // 绘制
//     this.draw()
//   },

//   draw() {
//     const ctx = wx.createCanvasContext('klineCanvas', this)
//     const data = this.data.kline
//     const canvasHeight = 400
//     const barWidth = 4
//     const spacing = 2

//     ctx.clearRect(0, 0, 360, canvasHeight)

//     data.forEach((d, i) => {
//       const x = i * (barWidth + spacing) + 10
//       const openY = canvasHeight - d.open * canvasHeight
//       const closeY = canvasHeight - d.close * canvasHeight
//       const highY = canvasHeight - d.high * canvasHeight
//       const lowY = canvasHeight - d.low * canvasHeight

//       const color = d.close >= d.open ? '#ff4d4f' : '#4caf50'
//       ctx.setStrokeStyle(color)
//       ctx.setFillStyle(color)

//       // 高低线
//       ctx.beginPath()
//       ctx.moveTo(x + barWidth / 2, highY)
//       ctx.lineTo(x + barWidth / 2, lowY)
//       ctx.stroke()

//       // 蜡烛矩形
//       const rectY = Math.min(openY, closeY)
//       const rectHeight = Math.abs(openY - closeY)
//       ctx.fillRect(x, rectY, barWidth, rectHeight || 1)
//     })

//     ctx.draw()
//   },

//   onCanvasTap(e) {
//     const x = e.detail.x
//     const barWidth = 4
//     const spacing = 2
//     const index = Math.floor((x - 10) / (barWidth + spacing))
//     if (index >= 0 && index < this.data.kline.length) {
//       this.setData({ selectedPoint: this.data.kline[index] })
//     }
//   },

//   onAgeChange(e) {
//     this.setData({ currentAge: e.detail.value })
//   },

//   openFullscreen() {
//     wx.navigateTo({
//       url: '/pages/fullscreen/fullscreen'
//     })
//   }
// })

// 四、优化效果

// 页面首次加载：

// 如果本地缓存存在，直接使用，不重复生成 K 线

// 滑块切换 / 全屏打开：

// 使用缓存数据，减少计算开销

// 缓存 key：

// 根据出生年份唯一标识

// 兼容前面优化：

// 点位点击解释文本

// 真 K 线蜡烛

// 不影响任何 utils 冻结版
