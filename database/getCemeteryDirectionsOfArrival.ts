import sqlite from 'better-sqlite3'

import type { directionsOfArrival } from '../data/dataLists.js'
import { sunriseDB } from '../helpers/database.helpers.js'

export default function getCemeteryDirectionsOfArrival(
  cemeteryId: number | string,
  connectedDatabase?: sqlite.Database
): Partial<Record<(typeof directionsOfArrival)[number], string>> {
  const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true })

  const directionsList = database
    .prepare(
      `select directionOfArrival, directionOfArrivalDescription
        from CemeteryDirectionsOfArrival
        where cemeteryId = ?`
    )
    .all(cemeteryId) as Array<{
    directionOfArrival: (typeof directionsOfArrival)[number]
    directionOfArrivalDescription: string
  }>

  const directions: Partial<
    Record<(typeof directionsOfArrival)[number], string>
  > = {}

  for (const direction of directionsList) {
    directions[direction.directionOfArrival] =
      direction.directionOfArrivalDescription
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return directions
}
