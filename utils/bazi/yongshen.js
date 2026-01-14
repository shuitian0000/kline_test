//五、旺衰 & 用神（去玄学，留逻辑）
export function analyzeStrength(wuxing, dayStemWuxing) {
  const self = wuxing[dayStemWuxing];
  const avg = Object.values(wuxing).reduce((a,b)=>a+b,0)/5;

  if(self > avg*1.2) return 'strong';
  if(self < avg*0.8) return 'weak';
  return 'balanced';
}

export function getYongShen(wuxing, strength) {
  const sorted = Object.entries(wuxing).sort((a,b)=>a[1]-b[1]);
  if(strength==='strong') return sorted[0][0]; // 泄耗
  if(strength==='weak') return sorted.reverse()[0][0]; // 扶助
  return sorted[2][0];
}
