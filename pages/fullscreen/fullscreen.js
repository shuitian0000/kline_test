Page({
  data: {
    kline: [],        // K 线数据
    offsetX: 0,       // 水平偏移量
    scale: 1,         // K 线缩放比例
    startX: 0,        // 滑动起点
    isTouching: false,
    selectedPoint: null
  },

  onLoad(options) {
    const kline = options.klineData || []
    this.setData({ kline })
    this.draw()
  },

  onReady() {
    wx.setScreenOrientation({ orientation: 'landscape' })
  },

  draw() {
    const ctx = wx.createCanvasContext('fullCanvas', this)
    const data = this.data.kline
    const canvasHeight = 300
    const canvasWidth = wx.getSystemInfoSync().windowWidth
    const baseBarWidth = 6
    const spacing = 3
    const barWidth = baseBarWidth * this.data.scale
    const offsetX = this.data.offsetX

    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    data.forEach((d, i) => {
      const x = i * (barWidth + spacing) + 10 + offsetX
      if (x < -barWidth || x > canvasWidth) return // 剔除屏幕外绘制

      const openY = canvasHeight - d.open * canvasHeight
      const closeY = canvasHeight - d.close * canvasHeight
      const highY = canvasHeight - d.high * canvasHeight
      const lowY = canvasHeight - d.low * canvasHeight

      const color = d.close >= d.open ? '#ff4d4f' : '#4caf50'
      ctx.setStrokeStyle(color)
      ctx.setFillStyle(color)

      // 高低线
      ctx.beginPath()
      ctx.moveTo(x + barWidth / 2, highY)
      ctx.lineTo(x + barWidth / 2, lowY)
      ctx.stroke()

      // 蜡烛矩形
      const rectY = Math.min(openY, closeY)
      const rectHeight = Math.abs(openY - closeY)
      ctx.fillRect(x, rectY, barWidth, rectHeight || 1)
    })

    ctx.draw()
  },

  // 点击事件显示解释
  onCanvasTap(e) {
    const touchX = e.detail.x
    const baseBarWidth = 6
    const spacing = 3
    const barWidth = baseBarWidth * this.data.scale
    const offsetX = this.data.offsetX

    const index = Math.floor((touchX - 10 - offsetX) / (barWidth + spacing))
    if (index >= 0 && index < this.data.kline.length) {
      this.setData({ selectedPoint: this.data.kline[index] })
    }
  },

  // 滑动事件
  onTouchStart(e) {
    this.setData({ startX: e.touches[0].clientX, isTouching: true })
  },

  onTouchMove(e) {
    if (!this.data.isTouching) return
    const deltaX = e.touches[0].clientX - this.data.startX
    this.setData({
      offsetX: this.data.offsetX + deltaX,
      startX: e.touches[0].clientX
    })
    this.draw()
  },

  onTouchEnd() {
    this.setData({ isTouching: false })
  },

  // 缩放
  onScaleChange(scaleFactor) {
    const newScale = Math.max(0.5, Math.min(3, this.data.scale * scaleFactor))
    this.setData({ scale: newScale })
    this.draw()
  }
})



// Page({

// onReady() {
//   wx.setScreenOrientation({ orientation: 'landscape' })
//   this.drawFullCanvas()
// },

// drawFullCanvas() {
//   const ctx = wx.createCanvasContext('fullCanvas', this)
//   const kline = this.data.kline || []
//   const canvasHeight = 300
//   const canvasWidth = wx.getSystemInfoSync().windowWidth
//   const barWidth = 6
//   const spacing = 3

//   ctx.clearRect(0, 0, canvasWidth, canvasHeight)

//   kline.forEach((d, i) => {
//     const x = i * (barWidth + spacing) + 10
//     const openY = canvasHeight - d.open * canvasHeight
//     const closeY = canvasHeight - d.close * canvasHeight
//     const highY = canvasHeight - d.high * canvasHeight
//     const lowY = canvasHeight - d.low * canvasHeight

//     const color = d.close >= d.open ? '#ff4d4f' : '#4caf50'
//     ctx.setStrokeStyle(color)
//     ctx.setFillStyle(color)

//     // 高低线
//     ctx.beginPath()
//     ctx.moveTo(x + barWidth / 2, highY)
//     ctx.lineTo(x + barWidth / 2, lowY)
//     ctx.stroke()

//     // 矩形蜡烛
//     const rectY = Math.min(openY, closeY)
//     const rectHeight = Math.abs(openY - closeY)
//     ctx.fillRect(x, rectY, barWidth, rectHeight || 1)
//   })

//   ctx.draw()
// },

// onCanvasTap(e) {
//   const x = e.detail.x
//   const barWidth = 6
//   const spacing = 3
//   const index = Math.floor((x - 10) / (barWidth + spacing))
//   if (index >= 0 && index < this.data.kline.length) {
//     this.setData({ selectedPoint: this.data.kline[index] })
//   }
// }

  
//   // onReady() {
//   //   wx.setScreenOrientation({
//   //     orientation: 'landscape'
//   //   })
//   // }
// })


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
