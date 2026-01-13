// pages/kline/kline.js
import { explainPoint } from '../../utils/destiny/explain-engine'

Page({
  data: { kline: [] },

  onLoad() {
    this.setData({ kline: getApp().globalData.kline })
  },

  onSelect(e) {
    const point = e.detail
    const plan = getApp().globalData.plan || 'free'
    const text = explainPoint(point, plan)
    wx.showModal({
      title: `${point.ageStart}-${point.ageEnd} 岁阶段`,
      content: text,
      showCancel: false
    })
  }
})

