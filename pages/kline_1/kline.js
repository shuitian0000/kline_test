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

    this.setData({ kline })
    this.draw()
  },

  draw() {
    const ctx = wx.createCanvasContext('klineCanvas', this)
    const data = this.data.kline
    const h = 200

    data.forEach((d, i) => {
      const x = i * 5 + 10
      const yOpen = h - d.open * h
      const yClose = h - d.close * h

      ctx.beginPath()
      ctx.moveTo(x, yOpen)
      ctx.lineTo(x, yClose)
      ctx.stroke()
    })

    ctx.draw()
  },

  onCanvasTap(e) {
    const x = e.detail.x
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
