
import { evolveWeights } from './weight-adjust'
import { allowEvolve } from './evolve-policy'

export function applyFeedback(age, predicted, feedback) {
  const profile = wx.getStorageSync('evolve_profile') || {
    weights:{bz:1,soc:1,phase:1},
    history:[]
  }

  if (!allowEvolve(profile)) return profile

  profile.history.push({ age, predicted, feedback })
  evolveWeights(profile, feedback)

  wx.setStorageSync('evolve_profile', profile)
  return profile
}
