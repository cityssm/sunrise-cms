import { acquireConnection } from './pool.js'
import type { PoolConnection } from 'better-sqlite-pool'

import type * as recordTypes from '../../types/recordTypes'
import { updateRecordOrderNumber } from './updateRecordOrderNumber.js'

export async function getOccupancyTypeFields(
  occupancyTypeId?: number,
  connectedDatabase?: PoolConnection
): Promise<recordTypes.OccupancyTypeField[]> {
  const database = connectedDatabase ?? (await acquireConnection())

  const sqlParameters: unknown[] = []

  if ((occupancyTypeId ?? -1) !== -1) {
    sqlParameters.push(occupancyTypeId)
  }

  const occupancyTypeFields = database
    .prepare(
      'select occupancyTypeFieldId,' +
        ' occupancyTypeField, occupancyTypeFieldValues, isRequired, pattern,' +
        ' minimumLength, maximumLength,' +
        ' orderNumber' +
        ' from OccupancyTypeFields' +
        ' where recordDelete_timeMillis is null' +
        ((occupancyTypeId ?? -1) === -1
          ? ' and occupancyTypeId is null'
          : ' and occupancyTypeId = ?') +
        ' order by orderNumber, occupancyTypeField'
    )
    .all(sqlParameters) as recordTypes.OccupancyTypeField[]

  let expectedOrderNumber = 0

  for (const occupancyTypeField of occupancyTypeFields) {
    if (occupancyTypeField.orderNumber !== expectedOrderNumber) {
      updateRecordOrderNumber(
        'OccupancyTypeFields',
        occupancyTypeField.occupancyTypeFieldId!,
        expectedOrderNumber,
        database
      )

      occupancyTypeField.orderNumber = expectedOrderNumber
    }

    expectedOrderNumber += 1
  }

  if (connectedDatabase === undefined) {
    database.release()
  }

  return occupancyTypeFields
}

export default getOccupancyTypeFields
