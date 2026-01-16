export function mapYearAge(birthYear, startAge, endAge) {
  const list = []
  for (let age = startAge; age <= endAge; age++) {
    list.push({
      age,
      year: birthYear + age
    })
  }
  return list
}
