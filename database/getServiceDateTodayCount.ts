import { dateToInteger } from '@cityssm/utils-datetime'

import { getDatabaseConnection } from '../helpers/database.helpers.js'

export default function getServiceDateTodayCount(): number {
  const database = getDatabaseConnection(true)

  const row = database
    .prepare(
      /* sql */ `
      SELECT
        COUNT(*) AS count
      FROM
        Contracts
      WHERE
        recordDelete_timeMillis IS NULL
        AND funeralDate = ?
    `
    )
    .get(dateToInteger(new Date())) as { count: number } | undefined

  database.close()

  return row?.count ?? 0
}
