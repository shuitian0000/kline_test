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


// 一、目标

// 用 矩形 + 线条组合绘制 K 线蜡烛（Open/Close/High/Low）

// 避免 Math.random 生成高低点，改为 标准化数值

// 支持点击命中，兼容前面优化 1 的解释弹窗

// 优化绘制性能，减少重复绘制

// 四、优化说明

// 矩形蜡烛 + 竖线代替原来的直线模拟，直观显示 OHLC

// 避免随机生成高低点 → 保持数据一致性，可复现

// 点击命中算法优化：

// 原先 x / 5 偏差大

// 现在用 barWidth + spacing 精确对应 K 线

// Canvas 性能：

// 清空画布后绘制

// 每次只绘制必要元素

// 可后续加 requestAnimationFrame 或 wx.createOffscreenCanvas 做批量渲染

// 五、效果

// 可精确点击每根 K 线蜡烛

// 弹窗显示解释信息

// 全屏横屏模式支持

// 真 K 线蜡烛视觉效果明显提升

// 保持冻结版原则，兼容前面优化 1 的逻辑
