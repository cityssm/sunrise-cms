import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export interface AddForm {
  burialSiteId: number | string
  workOrderId: number | string
}

export default function addWorkOrderBurialSite(
  workOrderBurialSiteForm: AddForm,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  const recordDeleteTimeMillis = database
    .prepare(/* sql */ `
      SELECT
        recordDelete_timeMillis
      FROM
        WorkOrderBurialSites
      WHERE
        workOrderId = ?
        AND burialSiteId = ?
    `)
    .pluck()
    .get(
      workOrderBurialSiteForm.workOrderId,
      workOrderBurialSiteForm.burialSiteId
    ) as number | null | undefined

  if (recordDeleteTimeMillis === undefined) {
    database
      .prepare(/* sql */ `
        INSERT INTO
          WorkOrderBurialSites (
            workOrderId,
            burialSiteId,
            recordCreate_userName,
            recordCreate_timeMillis,
            recordUpdate_userName,
            recordUpdate_timeMillis
          )
        VALUES
          (?, ?, ?, ?, ?, ?)
      `)
      .run(
        workOrderBurialSiteForm.workOrderId,
        workOrderBurialSiteForm.burialSiteId,
        user.userName,
        rightNowMillis,
        user.userName,
        rightNowMillis
      )
  } else if (recordDeleteTimeMillis !== null) {
    database
      .prepare(/* sql */ `
        UPDATE WorkOrderBurialSites
        SET
          recordCreate_userName = ?,
          recordCreate_timeMillis = ?,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?,
          recordDelete_userName = NULL,
          recordDelete_timeMillis = NULL
        WHERE
          workOrderId = ?
          AND burialSiteId = ?
      `)
      .run(
        user.userName,
        rightNowMillis,
        user.userName,
        rightNowMillis,
        workOrderBurialSiteForm.workOrderId,
        workOrderBurialSiteForm.burialSiteId
      )
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return true
}
