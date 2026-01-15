// 一页总结占位

export function buildSummary({ year, core }) {
  return `
${year} 年度关键词：${core.join('、')}

建议围绕核心关键词展开年度规划，
在保持灵活性的同时，避免频繁方向切换。
`
}
