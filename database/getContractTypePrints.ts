import { type SQLOutputValue, DatabaseSync } from 'node:sqlite'

import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

const availablePrints = getConfigProperty('settings.contracts.prints')

// eslint-disable-next-line @typescript-eslint/naming-convention
function userFunction_configContainsPrintEJS(printEJS: SQLOutputValue): number {
  return printEJS === '*' || availablePrints.includes(printEJS as string)
    ? 1
    : 0
}

export default function getContractTypePrints(
  contractTypeId: number,
  connectedDatabase?: DatabaseSync
): string[] {
  const database = connectedDatabase ?? new DatabaseSync(sunriseDB)

  database.function(
    'userFn_configContainsPrintEJS',
    {
      deterministic: true
    },
    userFunction_configContainsPrintEJS
  )

  const results = database
    .prepare(/* sql */ `
      SELECT
        printEJS,
        orderNumber
      FROM
        ContractTypePrints
      WHERE
        recordDelete_timeMillis IS NULL
        AND contractTypeId = ?
        AND userFn_configContainsPrintEJS (printEJS) = 1
      ORDER BY
        orderNumber,
        printEJS
    `)
    .all(contractTypeId) as Array<{ orderNumber: number; printEJS: string }>

  let expectedOrderNumber = -1

  const prints: string[] = []

  for (const result of results) {
    expectedOrderNumber += 1

    if (result.orderNumber !== expectedOrderNumber) {
      database
        .prepare(/* sql */ `
          UPDATE ContractTypePrints
          SET
            orderNumber = ?
          WHERE
            contractTypeId = ?
            AND printEJS = ?
        `)
        .run(expectedOrderNumber, contractTypeId, result.printEJS)
    }

    prints.push(result.printEJS)
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return prints
}
