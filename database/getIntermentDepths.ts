import type { DatabaseSync } from 'node:sqlite'

import { getDatabaseConnection } from '../helpers/database.helpers.js'
import type { IntermentDepth } from '../types/record.types.js'

import updateRecordOrderNumber from './updateRecordOrderNumber.js'

export default function getIntermentDepths(
  includeDeleted = false,
  connectedDatabase?: DatabaseSync
): IntermentDepth[] {
  const database = connectedDatabase ?? getDatabaseConnection()

  const updateOrderNumbers = !includeDeleted

  const intermentDepths = database
    .prepare(/* sql */ `
      SELECT
        intermentDepthId,
        intermentDepth,
        intermentDepthKey,
        isAvailableOnPortal,
        orderNumber
      FROM
        IntermentDepths ${includeDeleted
          ? ''
          : ' WHERE recordDelete_timeMillis IS NULL '}
      ORDER BY
        orderNumber,
        intermentDepth,
        intermentDepthId
    `)
    .all() as unknown as IntermentDepth[]

  if (updateOrderNumbers) {
    let expectedOrderNumber = -1

    for (const intermentDepth of intermentDepths) {
      expectedOrderNumber += 1

      if (intermentDepth.orderNumber === expectedOrderNumber) {
        continue
      }

      updateRecordOrderNumber(
        'IntermentDepths',
        intermentDepth.intermentDepthId,
        expectedOrderNumber,
        database
      )

      intermentDepth.orderNumber = expectedOrderNumber
    }
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return intermentDepths
}
