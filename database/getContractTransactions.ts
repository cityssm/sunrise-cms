import { type SQLInputValue, DatabaseSync } from 'node:sqlite'

import {
  dateIntegerToString,
  timeIntegerToString
} from '@cityssm/utils-datetime'

import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'
import type { ContractTransaction } from '../types/record.types.js'

let getDynamicsGPDocument

if (getConfigProperty('integrations.dynamicsGP.integrationIsEnabled')) {
  const dynamicsGpHelpers =
    await import('../integrations/dynamicsGp/helpers.js')
  getDynamicsGPDocument = dynamicsGpHelpers.getDynamicsGPDocument
}

export default async function getContractTransactions(
  contractId: number | string,
  options: {
    includeIntegrations: boolean
  },
  connectedDatabase?: DatabaseSync
): Promise<ContractTransaction[]> {
  const database = connectedDatabase ?? new DatabaseSync(sunriseDB)

  database.function(
    'userFn_dateIntegerToString',
    (dateInteger: SQLInputValue) => dateIntegerToString(dateInteger as number)
  )

  database.function(
    'userFn_timeIntegerToString',
    (timeInteger: SQLInputValue) => timeIntegerToString(timeInteger as number)
  )

  const contractTransactions = database
    .prepare(/* sql */ `
      SELECT
        contractId,
        transactionIndex,
        transactionDate,
        userFn_dateIntegerToString (transactionDate) AS transactionDateString,
        transactionTime,
        userFn_timeIntegerToString (transactionTime) AS transactionTimeString,
        transactionAmount,
        externalReceiptNumber,
        isInvoiced,
        transactionNote
      FROM
        ContractTransactions
      WHERE
        recordDelete_timeMillis IS NULL
        AND contractId = ?
      ORDER BY
        transactionDate,
        transactionTime,
        transactionIndex
    `)
    .all(contractId) as unknown as ContractTransaction[]

  if (connectedDatabase === undefined) {
    database.close()
  }

  if (
    options.includeIntegrations &&
    getConfigProperty('integrations.dynamicsGP.integrationIsEnabled')
  ) {
    for (const transaction of contractTransactions) {
      if ((transaction.externalReceiptNumber ?? '') === '') {
        continue
      }

      // eslint-disable-next-line no-await-in-loop
      const gpDocument = await getDynamicsGPDocument(
        transaction.externalReceiptNumber ?? ''
      )

      if (gpDocument !== undefined) {
        transaction.dynamicsGPDocument = gpDocument
      }
    }
  }

  return contractTransactions
}
