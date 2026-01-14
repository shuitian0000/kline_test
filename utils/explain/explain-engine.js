export function explainYear(point) {
  const parts = [];

  parts.push(
    `${point.age} 岁（${point.year}年）处于当前人生阶段的一个运势节点。`
  );

  parts.push(
    `从个人条件看，该阶段的能量配置更偏向「${point.dayun} 运势结构」。`
  );

  if (point.society.volatility > 1) {
    parts.push(
      '宏观环境的不确定性相对较高，更适合控制节奏、降低单次决策风险。'
    );
  } else {
    parts.push(
      '外部环境相对稳定，有利于中长期规划的推进。'
    );
  }

  parts.push(
    '建议将重点放在可控因素上，避免对短期结果产生过度预期。'
  );

  return parts.join('\n');
}

