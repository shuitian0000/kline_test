// utils/destiny/kline-generator.js
import { splitLifeStages } from './decade'

import { getSocietyContext } from './society'

export function generateLifeKLine(profile) {
  const stages = splitLifeStages()
  let lastClose = 0.5

  return stages.map(stage => {
    const baseTrend = baseTrendByAge(stage.ageMid)
    const personalBias = personalFactor(profile)
    const open = lastClose
    let close = clamp(open + baseTrend + personalBias)

    const volatility = baseVolatility(stage.ageMid)

    // 社会周期修正
    const macro = getSocietyContext(stage)
    const adjustedVol = clamp(volatility + macro.volatility*0.5)

    const high = clamp(Math.max(open, close) + adjustedVol)
    const low = clamp(Math.min(open, close) - adjustedVol)
    const riskLevel = clamp(adjustedVol*0.6 + Math.abs(close-open)*0.8)
    const strategyBias = riskLevel>0.7?'偏稳':riskLevel<0.3?'偏进':'平衡'

    lastClose = close
    return {
      ...stage,
      open, close, high, low,
      trend: close>open?'up':close<open?'down':'flat',
      riskLevel,
      strategyBias,
      macroContext: macro,
      explainSeed: { age: stage.ageMid, volatility: adjustedVol, delta: close-open }
    }
  })
}

// export function generateLifeKLine(profile) {
//   const stages = splitLifeStages()
//   let lastClose = 0.5

//   return stages.map(stage => {
//     const baseTrend = baseTrendByAge(stage.ageMid)
//     const personalBias = personalFactor(profile)
//     const open = lastClose
//     let close = clamp(open + baseTrend + personalBias)
//     const volatility = baseVolatility(stage.ageMid)
//     const high = clamp(Math.max(open, close) + volatility)
//     const low = clamp(Math.min(open, close) - volatility)
//     const riskLevel = clamp(volatility*0.6 + Math.abs(close-open)*0.8)
//     const strategyBias = riskLevel>0.7?'偏稳':riskLevel<0.3?'偏进':'平衡'
//     lastClose = close
//     return { ...stage, open, close, high, low, trend: close>open?'up':close<open?'down':'flat', riskLevel, strategyBias, explainSeed: { age: stage.ageMid, volatility, delta: close-open } }
//   })
// }

function baseTrendByAge(age) { if(age<25) return 0.05; if(age<35) return 0.08; if(age<45) return 0.03; if(age<55) return -0.02; if(age<65) return -0.04; return -0.02 }
function baseVolatility(age) { if(age<30) return 0.18; if(age<45) return 0.14; if(age<60) return 0.10; return 0.08 }
function personalFactor(profile) { const balance=profile?.wuxingBalance||0; return clamp(balance*0.05,-0.05,0.05) }
function clamp(v,min=0,max=1){return Math.max(min,Math.min(max,v))}

