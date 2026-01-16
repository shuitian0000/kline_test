import { buildBaziProfile } from '../../utils/bazi'
import { generateLifeKline } from '../../utils/kline'

Page({
  data: {
    kline: [],
    currentAge: 30,
    selectedPoint: null
  },

  onLoad(query) {
    const year = Number(query.year)
    const profile = buildBaziProfile({ year })

    const kline = generateLifeKline(profile, {
      birthYear: year,
      startAge: 10,
      endAge: 80
    })

    this.setData({ kline })
    this.draw()
  },

  draw() {
    const ctx = wx.createCanvasContext('klineCanvas', this)
    const data = this.data.kline

    const w = 300
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

  onAgeChange(e) {
    this.setData({ currentAge: e.detail.value })
  },

  openFullscreen() {
    wx.navigateTo({
      url: '/pages/fullscreen/fullscreen'
    })
  }
})
