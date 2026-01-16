Page({

onReady() {
  wx.setScreenOrientation({ orientation: 'landscape' })
  this.drawFullCanvas()
},

drawFullCanvas() {
  const ctx = wx.createCanvasContext('fullCanvas', this)
  const kline = this.data.kline || []
  const canvasHeight = 300
  const canvasWidth = wx.getSystemInfoSync().windowWidth
  const barWidth = 6
  const spacing = 3

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  kline.forEach((d, i) => {
    const x = i * (barWidth + spacing) + 10
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

    // 矩形蜡烛
    const rectY = Math.min(openY, closeY)
    const rectHeight = Math.abs(openY - closeY)
    ctx.fillRect(x, rectY, barWidth, rectHeight || 1)
  })

  ctx.draw()
},

onCanvasTap(e) {
  const x = e.detail.x
  const barWidth = 6
  const spacing = 3
  const index = Math.floor((x - 10) / (barWidth + spacing))
  if (index >= 0 && index < this.data.kline.length) {
    this.setData({ selectedPoint: this.data.kline[index] })
  }
}

  
  // onReady() {
  //   wx.setScreenOrientation({
  //     orientation: 'landscape'
  //   })
  // }
})
