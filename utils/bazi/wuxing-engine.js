import { GAN_WUXING } from './wuxing-map';
import { HIDDEN_STEMS } from './dizhi-hidden';

export function calcWuxing(pillars) {
  const score = {wood:0,fire:0,earth:0,metal:0,water:0};

  pillars.forEach(p=>{
    score[GAN_WUXING[p[0]]] += 1;
    HIDDEN_STEMS[p[1]].forEach(h=>{
      score[GAN_WUXING[h.g]] += h.w;
    });
  });

  return score;
}
