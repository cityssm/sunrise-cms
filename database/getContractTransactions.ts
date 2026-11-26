import type { DatabaseSync, SQLInputValue } from 'node:sqlite'

import {
  dateIntegerToString,
  timeIntegerToString
} from '@cityssm/utils-datetime'

import { getConfigProperty } from '../helpers/config.helpers.js'
import { getDatabaseConnection } from '../helpers/database.helpers.js'
import type { ContractTransaction } from '../types/record.types.js'

let getDynamicsGpDocument

if (getConfigProperty('integrations.dynamicsGp.integrationIsEnabled')) {
  const dynamicsGpHelpers =
    await import('../integrations/dynamicsGp/helpers.js')

  getDynamicsGpDocument = dynamicsGpHelpers.getDynamicsGpDocument
}

export default async function getContractTransactions(
  contractId: number | string,
  options: {
    includeIntegrations: boolean
  },
  connectedDatabase?: DatabaseSync
): Promise<ContractTransaction[]> {
  const database = connectedDatabase ?? getDatabaseConnection()

  database.function(
    'userFn_dateIntegerToString',
    {
      deterministic: true
    },
    (dateInteger: SQLInputValue) => dateIntegerToString(dateInteger as number)
  )

  database.function(
    'userFn_timeIntegerToString',
    {
      deterministic: true
    },
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
        t.paymentTypeId,
        pt.paymentType,
        transactionNote
      FROM
        ContractTransactions t
        LEFT JOIN PaymentTypes pt ON t.paymentTypeId = pt.paymentTypeId
      WHERE
        t.recordDelete_timeMillis IS NULL
        AND t.contractId = ?
      ORDER BY
        t.transactionDate,
        t.transactionTime,
        t.transactionIndex
    `)
    .all(contractId) as unknown as ContractTransaction[]

  if (connectedDatabase === undefined) {
    database.close()
  }

  if (
    options.includeIntegrations &&
    getConfigProperty('integrations.dynamicsGp.integrationIsEnabled')
  ) {
    for (const transaction of contractTransactions) {
      if ((transaction.externalReceiptNumber ?? '') === '') {
        continue
      }

      // eslint-disable-next-line no-await-in-loop
      const gpDocument = await getDynamicsGpDocument(
        transaction.externalReceiptNumber ?? ''
      )

      if (gpDocument !== undefined) {
        transaction.dynamicsGPDocument = gpDocument
      }
    }
  }

  return contractTransactions
}
