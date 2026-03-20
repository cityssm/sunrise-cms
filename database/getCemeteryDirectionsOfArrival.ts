import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { directionsOfArrival } from '../helpers/dataLists.js'

export default function getCemeteryDirectionsOfArrival(
  cemeteryId: number | string,
  connectedDatabase?: sqlite.Database
): Partial<Record<(typeof directionsOfArrival)[number], string>> {
  const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true })

  const directionsList = database
    .prepare(/* sql */ `
      SELECT
        directionOfArrival,
        directionOfArrivalDescription
      FROM
        CemeteryDirectionsOfArrival
      WHERE
        cemeteryId = ?
    `)
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
