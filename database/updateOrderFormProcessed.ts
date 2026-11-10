import type { DatabaseSync } from 'node:sqlite'

import getObjectDifference from '@cityssm/object-difference'

import { isAuditLoggingEnabled } from '../helpers/config.helpers.js'
import { getDatabaseConnection } from '../helpers/database.helpers.js'

import createAuditLogEntries from './createAuditLogEntries.js'

export default function updateOrderFormProcessed(
  orderFormId: number | string,
  isOrderFormProcessed = true,
  user: User,
  connectedDatabase?: DatabaseSync
): boolean {
  const database = connectedDatabase ?? getDatabaseConnection()

  const recordBefore = isAuditLoggingEnabled
    ? database
        .prepare(/* sql */ `
          SELECT
            *
          FROM
            OrderForms
          WHERE
            orderFormId = ?
            AND recordDelete_timeMillis IS NULL
        `)
        .get(Number(orderFormId))
    : undefined

  const rightNowMillis = Date.now()

  const result = database
    .prepare(/* sql */ `
      UPDATE OrderForms
      SET
        isOrderFormProcessed = ?,
        recordUpdate_username = ?,
        recordUpdate_timeMillis = ?
      WHERE
        orderFormId = ?
        AND recordDelete_timeMillis IS NULL
    `)
    .run(
      isOrderFormProcessed ? 1 : 0,
      user.username,
      rightNowMillis,
      Number(orderFormId)
    )

  if (
    isAuditLoggingEnabled &&
    recordBefore !== undefined &&
    result.changes > 0
  ) {
    const recordAfter = database
      .prepare(/* sql */ `
        SELECT
          *
        FROM
          OrderForms
        WHERE
          orderFormId = ?
      `)
      .get(Number(orderFormId))

    const differences = getObjectDifference(recordBefore, recordAfter)

    if (differences.length > 0) {
      createAuditLogEntries(
        {
          mainRecordId: orderFormId,
          mainRecordType: 'orderForm',
          updateTable: 'OrderForms'
        },
        differences,
        user,
        database
      )
    }
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result.changes > 0
}
