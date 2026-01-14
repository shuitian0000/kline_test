import os
import zipfile

ROOT = "kline_app_ultimate"

FILES = {
    "app.js": "App({})",
    "app.json": """{
  "pages": [
    "pages/index/index",
    "pages/kline/kline",
    "pages/cards/cards"
  ],
  "window": {
    "navigationBarTitleText": "人生K线",
    "navigationBarBackgroundColor": "#111",
    "navigationBarTextStyle": "white"
  }
}""",
    "app.wxss": "page{background:#000;color:#fff;}",

    "pages/index/index.js": """Page({
  data:{name:''},
  onInput(e){this.setData({name:e.detail.value})},
  go(){
    wx.navigateTo({url:'/pages/kline/kline?name='+this.data.name})
  }
})""",

    "pages/index/index.wxml": """
<view class="wrap">
<input placeholder="姓名" bindinput="onInput"/>
<button bindtap="go">生成K线</button>
</view>
""",

    "pages/index/index.wxss": ".wrap{padding:40rpx}",
    "pages/index/index.json": "{\"navigationBarTitleText\":\"输入\"}",

    "pages/kline/kline.js": """import { generateLifeKline } from '../../utils/kline/life-kline'
import { drawKline } from '../../utils/kline/canvas-draw'
import { explain } from '../../utils/explain/explain-adapter'

Page({
  data:{
    data:[],
    current:0,
    explain:'',
    show:false,
    fullscreen:false
  },

  onLoad(){
    const data = generateLifeKline()
    this.setData({data})
    this.draw()
  },

  draw(){
    const ctx = wx.createCanvasContext('k')
    drawKline(ctx,this.data.data,this.data.current)
    ctx.draw()
  },

  onSlider(e){
    this.setData({current:Number(e.detail.value)})
    this.draw()
    explain(this.data.data[this.data.current]).then(t=>{
      this.setData({explain:t})
    })
  },

  toggle(){
    this.setData({fullscreen:!this.data.fullscreen})
  }
})
""",

    "pages/kline/kline.wxml": """
<view class="{{fullscreen?'full':''}}">
<slider min="0" max="{{data.length-1}}" bindchange="onSlider"/>
<canvas canvas-id="k" style="width:100%;height:600rpx"/>
<view class="panel">
<text>{{explain}}</text>
<button bindtap="toggle">全屏</button>
</view>
</view>
""",

    "pages/kline/kline.wxss": """
.full{position:fixed;top:0;left:0;width:100vw;height:100vh;background:#000}
.panel{padding:20rpx}
""",

    "pages/kline/kline.json": "{\"navigationBarTitleText\":\"K线\"}",

    "pages/cards/cards.js": """Page({
  data:{cards:[{title:'风险提示',advice:'今年宜稳'}]}
})""",

    "pages/cards/cards.wxml": "<view wx:for='{{cards}}'>{{item.title}}:{{item.advice}}</view>",
    "pages/cards/cards.wxss": "",
    "pages/cards/cards.json": "{\"navigationBarTitleText\":\"卡片\"}",

    "utils/kline/life-kline.js": """export function generateLifeKline(){
  const arr=[]
  for(let i=0;i<80;i++){
    arr.push({year:2025+i,value:Math.sin(i/5)+Math.random()})
  }
  return arr
}""",

    "utils/kline/canvas-draw.js": """export function drawKline(ctx,data,idx){
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
}""",

    "utils/explain/explain-adapter.js": """export async function explain(p){
  return `${p.year}年走势${p.value>0?'上行':'回调'}`
}""",

    "utils/explain/local-engine.js": "",
    "utils/bazi/ganzhi.js": "",
    "utils/bazi/lunar.js": "",
    "utils/bazi/wuxing-map.js": "",
    "utils/decision/decision-engine.js": "",

    "cloudfunctions/explainLLM/index.js": "exports.main=async()=>({text:'ok'})"
}

def write():
    for path,content in FILES.items():
        full=os.path.join(ROOT,path)
        os.makedirs(os.path.dirname(full),exist_ok=True)
        with open(full,"w",encoding="utf-8") as f:
            f.write(content)

def zipit():
    with zipfile.ZipFile("kline_app_ultimate.zip","w",zipfile.ZIP_DEFLATED) as z:
        for root,_,files in os.walk(ROOT):
            for f in files:
                p=os.path.join(root,f)
                z.write(p,os.path.relpath(p,ROOT))

write()
zipit()
print("✅ 已生成 kline_app_ultimate.zip")
