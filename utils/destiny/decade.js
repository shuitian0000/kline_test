// utils/destiny/decade.js
export function splitLifeStages() {
  const stages = []
  for (let age = 16; age <= 80; age += 10) {
    stages.push({ ageStart: age, ageEnd: age + 9, ageMid: age + 4.5 })
  }
  return stages
}

