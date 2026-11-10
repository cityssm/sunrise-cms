import type { DatabaseSync } from 'node:sqlite'

import { isAuditLoggingEnabled } from '../helpers/config.helpers.js'
import { getDatabaseConnection } from '../helpers/database.helpers.js'

import createAuditLogEntries from './createAuditLogEntries.js'

export default function deleteOrderForm(
  orderFormId: number | string,
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
        recordDelete_timeMillis = ?,
        recordDelete_username = ?
      WHERE
        orderFormId = ?
        AND recordDelete_timeMillis IS NULL
    `)
    .run(rightNowMillis, user.username, Number(orderFormId))

  if (isAuditLoggingEnabled && result.changes > 0) {
    createAuditLogEntries(
      {
        mainRecordId: orderFormId,
        mainRecordType: 'orderForm',
        updateTable: 'OrderForms'
      },
      [
        {
          from: recordBefore,
          property: '*',
          to: undefined,
          type: 'deleted'
        }
      ],
      user,
      database
    )
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result.changes > 0
}
