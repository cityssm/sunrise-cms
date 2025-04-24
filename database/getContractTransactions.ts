import {
  dateIntegerToString,
  timeIntegerToString
} from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'
import { getDynamicsGPDocument } from '../helpers/functions.dynamicsGP.js'
import type { ContractTransaction } from '../types/record.types.js'

export default async function GetContractTransactions(
  contractId: number | string,
  options: {
    includeIntegrations: boolean
  },
  connectedDatabase?: sqlite.Database
): Promise<ContractTransaction[]> {
  const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true })

  database.function('userFn_dateIntegerToString', dateIntegerToString)
  database.function('userFn_timeIntegerToString', timeIntegerToString)

  const contractTransactions = database
    .prepare(
      `select contractId, transactionIndex,
        transactionDate, userFn_dateIntegerToString(transactionDate) as transactionDateString,
        transactionTime, userFn_timeIntegerToString(transactionTime) as transactionTimeString,
        transactionAmount, externalReceiptNumber, transactionNote
        from ContractTransactions
        where recordDelete_timeMillis is null
        and contractId = ?
        order by transactionDate, transactionTime, transactionIndex`
    )
    .all(contractId) as ContractTransaction[]

  if (connectedDatabase === undefined) {
    database.close()
  }

  if (
    options.includeIntegrations &&
    getConfigProperty('settings.dynamicsGP.integrationIsEnabled')
  ) {
    for (const transaction of contractTransactions) {
      if ((transaction.externalReceiptNumber ?? '') !== '') {
        const gpDocument = await getDynamicsGPDocument(
          transaction.externalReceiptNumber ?? ''
        )

        if (gpDocument !== undefined) {
          transaction.dynamicsGPDocument = gpDocument
        }
      }
    }
  }

  return contractTransactions
}
