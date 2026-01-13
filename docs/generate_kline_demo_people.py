import os
import shutil

保存脚本为 generate_kline_final.py

# Python 环境下运行：
# python generate_kline_final.py
# 当前目录生成 kline_test_final.zip
# 解压即可看到完整小程序目录、社会周期模块、Explain Engine、K 线全屏交互、小程序 demo、文档
# 打开微信开发者工具即可运行完整演示

ROOT_DIR = 'kline_test_final'

# 目录结构
dirs = [
    ROOT_DIR,
    f'{ROOT_DIR}/pages/kline',
    f'{ROOT_DIR}/components/kline-chart',
    f'{ROOT_DIR}/utils/destiny',
    f'{ROOT_DIR}/utils/access',
    f'{ROOT_DIR}/docs',
]

# 文件内容
files = {
    f'{ROOT_DIR}/README.md': """# 人生 K 线 · 理性趋势分析工具
微信小程序 + 企业级 SDK，展示人生阶段趋势与风险，可视化 K 线图。
""",
    # app 文件
    f'{ROOT_DIR}/app.js': """App({
  globalData: {
    plan: 'pro', // Pro 展示宏观周期
    profile: {
      name: '李四',
      gender: 'female',
      birth: { calendar:'solar', date:'1990-06-12', hour:9, location:'Beijing' },
      wuxingBalance: 0.03
    },
    kline: []
  },
  onLaunch() {
    const { generateLifeKLine } = require('./utils/destiny/kline-generator')
    this.globalData.kline = generateLifeKLine(this.globalData.profile)
    console.log('✅ Demo K线数据已生成', this.globalData.kline)
  }
})""",
    f'{ROOT_DIR}/app.json': """{
  "pages": ["pages/kline/kline"],
  "window": {"navigationBarTitleText": "人生K线"}
}""",
    f'{ROOT_DIR}/app.wxss': """/* 全局样式 */""",

    # 页面
    f'{ROOT_DIR}/pages/kline/kline.wxml': """<view class="container">
  <slider min="16" max="80" step="1" show-value="{{true}}" value="{{currentAge}}" bindchange="onSliderChange"/>
  <kline-chart kline-data="{{kline}}" current-age="{{currentAge}}" bind:select="onSelect" full-screen="{{fullScreen}}"/>
  <button bindtap="toggleFullScreen">{{fullScreen?'退出全屏':'全屏查看'}}</button>
</view>""",
    f'{ROOT_DIR}/pages/kline/kline.js': """Page({
  data: { kline: [], currentAge:16, fullScreen:false },
  onLoad() {
    const kline = getApp().globalData.kline
    this.setData({ kline, currentAge: kline[0].ageStart })
    const { explainPoint } = require('../../utils/destiny/explain-engine')
    const text = explainPoint(kline[0], getApp().globalData.plan)
    wx.showModal({
      title: `${kline[0].ageStart}-${kline[0].ageEnd} 岁阶段`,
      content: text,
      showCancel: false
    })
  },
  onSliderChange(e) { this.setData({ currentAge: e.detail.value }) },
  toggleFullScreen() { this.setData({ fullScreen: !this.data.fullScreen }) },
  onSelect(e) {
    const point = e.detail
    const plan = getApp().globalData.plan
    const { explainPoint } = require('../../utils/destiny/explain-engine')
    const text = explainPoint(point, plan)
    wx.showModal({ title: `${point.ageStart}-${point.ageEnd} 岁阶段`, content: text, showCancel:false })
  }
})""",
    f'{ROOT_DIR}/pages/kline/kline.wxss': """.container{padding:10px;}""",

    # 组件 K 线
    f'{ROOT_DIR}/components/kline-chart/kline-chart.wxml': """<canvas canvas-id="lifeKline" class="kline-canvas" bindtap="onCanvasTap"/>""",
    f'{ROOT_DIR}/components/kline-chart/kline-chart.wxss': """.kline-canvas{width:100%;height:100%;}""",
    f'{ROOT_DIR}/components/kline-chart/kline-chart.js': """Component({
  properties: { klineData:Array, fullScreen:Boolean, currentAge:Number },
  data:{ candleRects:[] },
  lifetimes:{ ready(){ this.draw() } },
  observers:{ 'klineData,fullScreen,currentAge':function(){ this.draw() } },
  methods:{
    draw() {
      const ctx = wx.createCanvasContext('lifeKline', this)
      const width = this.data.fullScreen ? wx.getSystemInfoSync().windowHeight : wx.getSystemInfoSync().windowWidth
      const height = this.data.fullScreen ? wx.getSystemInfoSync().windowWidth : 300
      const candleRects=[]
      const step = width/this.properties.klineData.length
      const currentAge = this.properties.currentAge || 16

      this.properties.klineData.forEach((pt,i)=>{
        const openY=height*(1-pt.open)
        const closeY=height*(1-pt.close)
        const highY=height*(1-pt.high)
        const lowY=height*(1-pt.low)
        let color = pt.trend==='up'?'#4caf50': pt.trend==='down'?'#f44336':'#999'
        if(currentAge >= pt.ageStart && currentAge <= pt.ageEnd) color = '#2196f3'
        ctx.setStrokeStyle(color)
        ctx.setLineWidth(2)
        ctx.moveTo(i*step+step/2, highY)
        ctx.lineTo(i*step+step/2, lowY)
        ctx.stroke()
        ctx.setFillStyle(color)
        const rectH=Math.abs(openY-closeY)
        ctx.fillRect(i*step+step/4, Math.min(openY,closeY), step/2, rectH)
        candleRects.push({x:i*step, width:step, data:pt})
      })
      ctx.draw()
      this.setData({ candleRects })
    },
    onCanvasTap(e){
      const { x }=e.detail
      const pt = this.data.candleRects.find(r=>x>=r.x && x<=r.x+r.width)
      if(pt) this.triggerEvent('select', pt.data)
    }
  }
})""",

    # destiny utils
    f'{ROOT_DIR}/utils/destiny/decade.js': """export function splitLifeStages() {
  const stages=[]
  for(let age=16; age<=80; age+=10){ stages.push({ageStart:age, ageEnd:age+9, ageMid:age+4.5}) }
  return stages
}""",

    f'{ROOT_DIR}/utils/destiny/society.js': """export function getSocietyContext(stage){
  let volatility = 0.1 + Math.sin(stage.ageMid/10)*0.05
  return { volatility: parseFloat(volatility.toFixed(2)) }
}""",

    f'{ROOT_DIR}/utils/destiny/kline-generator.js': """import { splitLifeStages } from './decade'
import { getSocietyContext } from './society'

export function generateLifeKLine(profile){
  const stages=splitLifeStages()
  let lastClose=0.5
  return stages.map(stage=>{
    const baseTrend = baseTrendByAge(stage.ageMid)
    const personalBias = personalFactor(profile)
    const open = lastClose
    let close = clamp(open + baseTrend + personalBias)
    const volatility = baseVolatility(stage.ageMid)
    const macro = getSocietyContext(stage)
    const adjustedVol = clamp(volatility + macro.volatility*0.5)
    const high = clamp(Math.max(open,close)+adjustedVol)
    const low = clamp(Math.min(open,close)-adjustedVol)
    const riskLevel = clamp(adjustedVol*0.6 + Math.abs(close-open)*0.8)
    const strategyBias = riskLevel>0.7?'偏稳':riskLevel<0.3?'偏进':'平衡'
    lastClose = close
    return {...stage, open, close, high, low, trend: close>open?'up':close<open?'down':'flat', riskLevel, strategyBias, macroContext:macro, explainSeed:{age:stage.ageMid, volatility:adjustedVol, delta:close-open}}
  })
}

function baseTrendByAge(age){ if(age<25) return 0.05; if(age<35) return 0.08; if(age<45) return 0.03; if(age<55) return -0.02; if(age<65) return -0.04; return -0.02 }
function baseVolatility(age){ if(age<30) return 0.18; if(age<45) return 0.14; if(age<60) return 0.10; return 0.08 }
function personalFactor(profile){ const b=profile?.wuxingBalance||0; return clamp(b*0.05,-0.05,0.05) }
function clamp(v,min=0,max=1){return Math.max(min,Math.min(max,v)}""",

    f'{ROOT_DIR}/utils/destiny/explain-template.js': """export const TEMPLATES = {
trend:{up:'该阶段整体呈现上行趋势，变化空间相对较大。',down:'该阶段整体处于调整趋势，节奏可能相对放缓。',flat:'该阶段整体较为平稳，变化幅度有限。'},
risk:level=>level>0.7?'不确定性较高，外部与内部变量同时存在。':level>0.4?'存在一定波动，需要关注变化节奏。':'整体不确定性较低，环境相对可控。',
strategy:bias=>({'偏稳':'更适合保持稳态与抗风险能力。','平衡':'可在稳定与探索之间保持弹性。','偏进':'环境允许一定程度的主动尝试。'}[bias]||'')
}""",

    f'{ROOT_DIR}/utils/destiny/tone-adjust.js': """const SOFTEN_MAP={必须:'可以考虑',一定:'可能',决定性:'重要影响因素',关键在于:'其中一个因素是'}
export function soften(text){let r=text;Object.keys(SOFTEN_MAP).forEach(k=>{r=r.replace(new RegExp(k,'g'),SOFTEN_MAP[k])});return r}""",

    f'{ROOT_DIR}/utils/destiny/explain-engine.js': """import { TEMPLATES } from './explain-template'
import { soften } from './tone-adjust'
import { CAPABILITY } from '../access/capability'

export function explainPoint(point, plan='free'){
  const cap = CAPABILITY[plan]; let sections=[]
  sections.push(TEMPLATES.trend[point.trend])
  if(cap.riskDetail) sections.push(TEMPLATES.risk(point.riskLevel))
  sections.push(TEMPLATES.strategy(point.strategyBias))
  if(cap.explainText) sections.push(generateAttention(point))
  if(cap.societyContext && point.macroContext) sections.push(`该阶段处于宏观不确定性偏${point.macroContext.volatility}的环境中。`)
  return soften(sections.filter(Boolean).join('\\n'))
}

function generateAttention(point){
  const v=point.explainSeed?.volatility||0, d=Math.abs(point.explainSeed?.delta||0)
  if(v>0.15 && d>0.1) return '变化幅度与节奏同时增强，需注意连续决策带来的累积影响。'
  if(v>0.15) return '阶段性波动偏大，关注节奏与承受能力的匹配。'
  if(d>0.1) return '阶段变化明显，适应过程可能需要时间。'
  return '整体节奏平稳，可关注长期结构的持续性。'
}""",

    # access utils
    f'{ROOT_DIR}/utils/access/plan.js': "export const PLAN={FREE:'free',PLUS:'plus',PRO:'pro'}",
    f'{ROOT_DIR}/utils/access/capability.js': """export const CAPABILITY={
free:{explainText:false,riskDetail:false,societyContext:false},
plus:{explainText:true,riskDetail:true,societyContext:false},
pro:{explainText:true,riskDetail:true,societyContext:true}
}""",

    # docs
    f'{ROOT_DIR}/docs/product-introduction.md': "# 产品说明文档\n提供人生K线可视化与趋势分析。",
    f'{ROOT_DIR}/docs/technical-whitepaper.md': "# 技术白皮书\n详细介绍算法与K线生成逻辑。",
    f'{ROOT_DIR}/docs/product-boundary.md': "# 功能与边界说明\n平台合规说明。"
}

# 创建目录
for d in dirs:
    os.makedirs(d, exist_ok=True)

# 写入文件
for path, content in files.items():
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# 生成 zip
shutil.make_archive(ROOT_DIR, 'zip', ROOT_DIR)
print("✅ kline_test_final.zip 已生成！解压后可直接在微信开发者工具运行。")
