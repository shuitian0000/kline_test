Page({
  data: {
    year: null,
    month: null,
    day: null
  },

  onYear(e) {
    this.setData({ year: Number(e.detail.value) })
  },

  onMonth(e) {
    this.setData({ month: Number(e.detail.value) })
  },

  onDay(e) {
    this.setData({ day: Number(e.detail.value) })
  },

  generate() {
    const { year, month, day } = this.data
    if (!year || !month || !day) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }

    wx.navigateTo({
      url: `/pages/kline/kline?year=${year}&month=${month}&day=${day}`
    })
  }
})
