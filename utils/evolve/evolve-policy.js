// 进化引擎总控（防止系统失控）


export function allowEvolve(profile) {
  return profile.history.length < 30
}
