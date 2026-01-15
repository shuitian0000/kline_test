export function drawKline(ctx,data,idx){
  const w=300,h=150
  ctx.clearRect(0,0,w,h)
  ctx.setStrokeStyle('#0f0')
  ctx.beginPath()
  data.forEach((p,i)=>{
    const x=i*(w/data.length)
    const y=h/2-p.value*40
    if(i===0)ctx.moveTo(x,y)
    else ctx.lineTo(x,y)
  })
  ctx.stroke()
  const x=idx*(w/data.length)
  ctx.setStrokeStyle('#f00')
  ctx.beginPath()
  ctx.moveTo(x,0)
  ctx.lineTo(x,h)
  ctx.stroke()
}
