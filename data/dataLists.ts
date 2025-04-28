export const deathAgePeriods = ['Years', 'Months', 'Days', 'Stillborn'] as const

export const purchaserRelationships = [
  'Spouse',
  'Husband',
  'Wife',
  'Child',
  'Parent',
  'Sibling',
  'Friend',
  'Self'
] as const

export const directionsOfArrival = [
  'N',
  'NE',
  'E',
  'SE',
  'S',
  'SW',
  'W',
  'NW'
] as const

export default {
  deathAgePeriods,
  directionsOfArrival,
  purchaserRelationships
}
