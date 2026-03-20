import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { directionsOfArrival } from '../helpers/dataLists.js'

import getCemeteryDirectionsOfArrival from './getCemeteryDirectionsOfArrival.js'

export const defaultDirectionsOfArrival = {
  E: 'East',
  N: 'North',
  S: 'South',
  W: 'West'
}

export default function getBurialSiteDirectionsOfArrival(
  burialSiteId: number | string,
  connectedDatabase?: sqlite.Database
): Partial<Record<(typeof directionsOfArrival)[number], string>> {
  const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true })

  const directionsList = database
    .prepare(/* sql */ `
      SELECT
        c.parentCemeteryId,
        d.directionOfArrival,
        d.directionOfArrivalDescription
      FROM
        BurialSites b
        LEFT JOIN Cemeteries c ON b.cemeteryId = c.cemeteryId
        LEFT JOIN CemeteryDirectionsOfArrival d ON c.cemeteryId = d.cemeteryId
      WHERE
        b.burialSiteId = ?
    `)
    .all(burialSiteId) as Array<{
    directionOfArrival: (typeof directionsOfArrival)[number] | null
    directionOfArrivalDescription: string | null
    parentCemeteryId: number | null
  }>

  let directions: Partial<
    Record<(typeof directionsOfArrival)[number], string>
  > = {}

  if (
    directionsList.length === 1 &&
    directionsList[0].directionOfArrival === null &&
    directionsList[0].parentCemeteryId !== null
  ) {
    directions = getCemeteryDirectionsOfArrival(
      directionsList[0].parentCemeteryId,
      connectedDatabase
    )
  } else if (
    directionsList.length > 0 &&
    directionsList[0].directionOfArrival !== null
  ) {
    for (const direction of directionsList) {
      directions[direction.directionOfArrival as string] =
        direction.directionOfArrivalDescription ?? ''
    }
  }

  if (Object.keys(directions).length === 0) {
    directions = defaultDirectionsOfArrival
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return directions
}
