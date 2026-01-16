import { buildBaziProfile } from '../../utils/bazi'
import { generateLifeKline } from '../../utils/kline'
import { calcSocietyFactor } from '../../utils/society'

Page({
  data: {
    kline: [],
    currentAge: 30,
    selectedPoint: null
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

      return {
        ...point,
        explanation: { text, risk, advice }
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

  onCanvasTap(e) {
    const x = e.detail.x    
    const barWidth = 4
    const spacing = 2
    const index = Math.floor((x - 10) / 5)
    if (index >= 0 && index < this.data.kline.length) {
      const point = this.data.kline[index]
      this.setData({ selectedPoint: point })
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
