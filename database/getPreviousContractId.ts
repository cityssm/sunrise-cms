import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export default function getPreviousContractId(
  contractId: number | string,
  connectedDatabase?: sqlite.Database
): number | undefined {
  const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true })

  const result = database
    .prepare(/* sql */ `
      SELECT
        contractId
      FROM
        Contracts
      WHERE
        recordDelete_timeMillis IS NULL
        AND contractId < ?
      ORDER BY
        contractId DESC
      LIMIT
        1
    `)
    .pluck()
    .get(contractId) as number | undefined

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result
}
