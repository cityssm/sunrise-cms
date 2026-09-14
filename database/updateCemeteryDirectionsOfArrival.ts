import type sqlite from 'better-sqlite3'

import { directionsOfArrival } from '../helpers/dataLists.js'

type DirectionOfArrivalIsAvailableOnPortalKey =
  `isAvailableOnPortal_${(typeof directionsOfArrival)[number]}`

type DirectionOfArrivalDescriptionKey =
  `directionOfArrivalDescription_${(typeof directionsOfArrival)[number]}`

type DirectionOfArrivalKey =
  `directionOfArrival_${(typeof directionsOfArrival)[number]}`

export type UpdateCemeteryDirectionsOfArrivalForm = Partial<
  Record<DirectionOfArrivalDescriptionKey, string>
> &
  Partial<Record<DirectionOfArrivalIsAvailableOnPortalKey, '0' | '1'>> &
  Partial<Record<DirectionOfArrivalKey, (typeof directionsOfArrival)[number]>>

export default function updateCemeteryDirectionsOfArrival(
  cemeteryId: number | string,
  updateForm: UpdateCemeteryDirectionsOfArrivalForm,
  database: sqlite.Database
): number {
  database
    .prepare(/* sql */ `
      DELETE FROM CemeteryDirectionsOfArrival
      WHERE
        cemeteryId = ?
    `)
    .run(cemeteryId)

  let updateCount = 0

  for (const direction of directionsOfArrival) {
    const directionDescriptionName = `directionOfArrivalDescription_${direction}`

    if (Object.hasOwn(updateForm, directionDescriptionName)) {
      database
        .prepare(/* sql */ `
          INSERT INTO
            CemeteryDirectionsOfArrival (
              cemeteryId,
              directionOfArrival,
              directionOfArrivalDescription,
              isAvailableOnPortal
            )
          VALUES
            (?, ?, ?, ?)
        `)
        .run(
          cemeteryId,
          direction,
          updateForm[directionDescriptionName] ?? '',
          updateForm[`isAvailableOnPortal_${direction}`] ?? '0'
        )

      updateCount += 1
    }
  }

  return updateCount
}
