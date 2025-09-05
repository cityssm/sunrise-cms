import type sqlite from 'better-sqlite3'

import { directionsOfArrival } from '../helpers/dataLists.js'

export type UpdateCemeteryDirectionsOfArrivalForm = Partial<
  Record<
    `directionOfArrival_${(typeof directionsOfArrival)[number]}`,
    (typeof directionsOfArrival)[number]
  >
> &
  Partial<
    Record<
      `directionOfArrivalDescription_${(typeof directionsOfArrival)[number]}`,
      string
    >
  >

export default function updateCemeteryDirectionsOfArrival(
  cemeteryId: number | string,
  updateForm: UpdateCemeteryDirectionsOfArrivalForm,
  database: sqlite.Database
): number {
  database
    .prepare(
      `delete from CemeteryDirectionsOfArrival
        where cemeteryId = ?`
    )
    .run(cemeteryId)

  let updateCount = 0

  for (const direction of directionsOfArrival) {
    const directionDescriptionName = `directionOfArrivalDescription_${direction}`

    if (directionDescriptionName in updateForm) {
      database
        .prepare(
          `insert into CemeteryDirectionsOfArrival (
            cemeteryId, directionOfArrival, directionOfArrivalDescription)
            values (?, ?, ?)`
        )
        .run(cemeteryId, direction, updateForm[directionDescriptionName] ?? '')

      updateCount += 1
    }
  }

  return updateCount
}
