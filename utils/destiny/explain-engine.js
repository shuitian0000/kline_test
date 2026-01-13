// utils/destiny/explain-engine.js
import { TEMPLATES } from './explain-template'
import { soften } from './tone-adjust'
import { CAPABILITY } from '../access/capability'

export function explainPoint(point, plan='free'){
  const cap=CAPABILITY[plan]; let sections=[]
  sections.push(TEMPLATES.trend[point.trend])
  if(cap.riskDetail) sections.push(TEMPLATES.risk(point.riskLevel))
  sections.push(TEMPLATES.strategy(point.strategyBias))
  if(cap.explainText) sections.push(generateAttention(point))
  if(cap.societyContext && point.macroContext) sections.push(`该阶段处于宏观不确定性偏${point.macroContext.volatility}的环境中。`)
  //这里 cap.societyContext 是付费 Pro 才显示的宏观信息。
  return soften(sections.filter(Boolean).join('\n'))
}

function generateAttention(point){
  const v=point.explainSeed?.volatility||0, d=Math.abs(point.explainSeed?.delta||0)
  if(v>0.15 && d>0.1) return '变化幅度与节奏同时增强，需注意连续决策带来的累积影响。'
  if(v>0.15) return '阶段性波动偏大，关注节奏与承受能力的匹配。'
  if(d>0.1) return '阶段变化明显，适应过程可能需要时间。'
  return '整体节奏平稳，可关注长期结构的持续性。'
}
