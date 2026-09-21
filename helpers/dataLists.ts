import { relationships as purchaserRelationships } from '@cityssm/cemetery-utils'

export const deathAgePeriods = ['Years', 'Months', 'Days', 'Stillborn'] as const

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
