import type { DatabaseSync } from 'node:sqlite'

import { getDatabaseConnection } from '../helpers/database.helpers.js'
import type { IntermentContainerType } from '../types/record.types.js'

import updateRecordOrderNumber from './updateRecordOrderNumber.js'

export default function getIntermentContainerTypes(
  shouldIncludeDeletedRecords = false,
  connectedDatabase?: DatabaseSync
): IntermentContainerType[] {
  const database = connectedDatabase ?? getDatabaseConnection()

  const shouldUpdateOrderNumbers = !shouldIncludeDeletedRecords

  const containerTypes = database
    .prepare(/* sql */ `
      SELECT
        intermentContainerTypeId,
        intermentContainerType,
        intermentContainerTypeKey,
        isCremationType,
        isAvailableOnPortal,
        orderNumber
      FROM
        IntermentContainerTypes ${shouldIncludeDeletedRecords
          ? ''
          : ' WHERE recordDelete_timeMillis IS NULL '}
      ORDER BY
        isCremationType,
        orderNumber,
        intermentContainerType,
        intermentContainerTypeId
    `)
    .all() as unknown as IntermentContainerType[]

  if (shouldUpdateOrderNumbers) {
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
