// utils/destiny/tone-adjust.js
const SOFTEN_MAP={必须:'可以考虑',一定:'可能',决定性:'重要影响因素',关键在于:'其中一个因素是'}
export function soften(text){let r=text;Object.keys(SOFTEN_MAP).forEach(k=>{r=r.replace(new RegExp(k,'g'),SOFTEN_MAP[k])});return r}
