import { DatabaseSync } from 'node:sqlite'

import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

export interface AddContractTypePrintForm {
  contractTypeId: number | string
  printEJS: string

  orderNumber?: number
}

// eslint-disable-next-line unicorn/consistent-boolean-name
export default function addContractTypePrint(
  form: AddContractTypePrintForm,
  user: User,
  connectedDatabase?: DatabaseSync
): boolean {
  const database = connectedDatabase ?? new DatabaseSync(sunriseDB)

  const rightNowMillis = Date.now()

  let result = database
    .prepare(/* sql */ `
      UPDATE ContractTypePrints
      SET
        recordUpdate_username = ?,
        recordUpdate_timeMillis = ?,
        recordDelete_username = NULL,
        recordDelete_timeMillis = NULL
      WHERE
        contractTypeId = ?
        AND printEJS = ?
    `)
    .run(
      user.username,
      rightNowMillis,
      form.contractTypeId,
      form.printEJS
    )

  if (result.changes === 0) {
    result = database
      .prepare(/* sql */ `
        INSERT INTO
          ContractTypePrints (
            contractTypeId,
            printEJS,
            orderNumber,
            recordCreate_username,
            recordCreate_timeMillis,
            recordUpdate_username,
            recordUpdate_timeMillis
          )
        VALUES
          (?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        form.contractTypeId,
        form.printEJS,
        form.orderNumber ?? -1,
        user.username,
        rightNowMillis,
        user.username,
        rightNowMillis
      )
  }

  if (connectedDatabase === undefined) {
    database.close()
  }
  clearCacheByTableName('ContractTypePrints')

  return result.changes > 0
}
