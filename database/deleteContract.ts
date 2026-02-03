import { dateToInteger } from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export function deleteContract(
  contractId: number | string,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  /*
   * Ensure no active work orders reference the contract
   */

  const currentDateInteger = dateToInteger(new Date())

  const activeWorkOrder = database
    .prepare(/* sql */ `
      SELECT
        workOrderId
      FROM
        WorkOrders
      WHERE
        recordDelete_timeMillis IS NULL
        AND workOrderId IN (
          SELECT
            workOrderId
          FROM
            WorkOrderContracts
          WHERE
            contractId = ?
            AND recordDelete_timeMillis IS NULL
        )
        AND (
          workOrderCloseDate IS NULL
          OR workOrderCloseDate >= ?
        )
    `)
    .pluck()
    .get(contractId, currentDateInteger) as number | undefined

  if (activeWorkOrder !== undefined) {
    if (connectedDatabase === undefined) {
      database.close()
    }
    return false
  }

  /*
   * Delete the contract
   */

  const rightNowMillis = Date.now()

  for (const tableName of ['Contracts', 'ContractFields', 'ContractComments']) {
    database
      .prepare(/* sql */ `
        UPDATE ${tableName}
        SET
          recordDelete_userName = ?,
          recordDelete_timeMillis = ?
        WHERE
          contractId = ?
          AND recordDelete_timeMillis IS NULL
      `)
      .run(user.userName, rightNowMillis, contractId)
  }

  if (connectedDatabase === undefined) {
    database.close()
  }
  return true
}
