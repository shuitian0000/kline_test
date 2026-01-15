// 年度报告生成引擎占位

import { REPORT_STRUCTURE } from './report-structure'
import * as sections from './report-sections'

export function buildAnnualReport(input) {
  const content = {}

  REPORT_STRUCTURE.forEach(sec => {
    content[sec.key] = sections[`build${capitalize(sec.key)}`](input)
  })

  return {
    year: input.year,
    content
  }
}

function capitalize(s){ return s.charAt(0).toUpperCase()+s.slice(1) }
