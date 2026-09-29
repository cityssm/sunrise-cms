import { DatabaseSync } from 'node:sqlite'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { IntermentContainerType } from '../types/record.types.js'

import updateRecordOrderNumber from './updateRecordOrderNumber.js'

export default function getIntermentContainerTypes(
  includeDeleted = false,
  connectedDatabase?: DatabaseSync
): IntermentContainerType[] {
  const database = connectedDatabase ?? new DatabaseSync(sunriseDB)

  const updateOrderNumbers = !includeDeleted

  const containerTypes = database
    // eslint-disable-next-line sqlite-security/no-unsafe-query
    .prepare(/* sql */ `
      SELECT
        intermentContainerTypeId,
        intermentContainerType,
        intermentContainerTypeKey,
        isCremationType,
        isAvailableOnPortal,
        orderNumber
      FROM
        IntermentContainerTypes ${includeDeleted
          ? ''
          : ' WHERE recordDelete_timeMillis IS NULL '}
      ORDER BY
        isCremationType,
        orderNumber,
        intermentContainerType,
        intermentContainerTypeId
    `)
    .all() as unknown as IntermentContainerType[]

  if (updateOrderNumbers) {
    let expectedOrderNumber = -1

    for (const containerType of containerTypes) {
      expectedOrderNumber += 1

      if (containerType.orderNumber === expectedOrderNumber) {
        continue
      }

      updateRecordOrderNumber(
        'IntermentContainerTypes',
        containerType.intermentContainerTypeId,
        expectedOrderNumber,
        database
      )

      containerType.orderNumber = expectedOrderNumber
    }
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return containerTypes
}
