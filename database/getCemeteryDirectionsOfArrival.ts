import { DatabaseSync } from 'node:sqlite'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { directionsOfArrival } from '../helpers/dataLists.js'

export default function getCemeteryDirectionsOfArrival(
  cemeteryId: number | string,
  connectedDatabase?: DatabaseSync
): Partial<Record<(typeof directionsOfArrival)[number], string>> {
  const database = connectedDatabase ?? new DatabaseSync(sunriseDB, { readOnly: true })

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
