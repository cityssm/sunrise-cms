import {
  dateIntegerToString,
  timeIntegerToString
} from '@cityssm/utils-datetime'
import type { PoolConnection } from 'better-sqlite-pool'

import { getConfigProperty } from '../helpers/config.helpers.js'
import { getDynamicsGPDocument } from '../helpers/functions.dynamicsGP.js'
import type { BurialSiteContractTransaction } from '../types/recordTypes.js'

import { acquireConnection } from './pool.js'

export default async function GetBurialSiteContractTransactions(
  burialSiteContractId: number | string,
  options: {
    includeIntegrations: boolean
  },
  connectedDatabase?: PoolConnection
): Promise<BurialSiteContractTransaction[]> {
  const database = connectedDatabase ?? (await acquireConnection())

  database.function('userFn_dateIntegerToString', dateIntegerToString)
  database.function('userFn_timeIntegerToString', timeIntegerToString)

  const lotOccupancyTransactions = database
    .prepare(
      `select burialSiteContractId, transactionIndex,
        transactionDate, userFn_dateIntegerToString(transactionDate) as transactionDateString,
        transactionTime, userFn_timeIntegerToString(transactionTime) as transactionTimeString,
        transactionAmount, externalReceiptNumber, transactionNote
        from BurialSiteContractTransactions
        where recordDelete_timeMillis is null
        and burialSiteContractId = ?
        order by transactionDate, transactionTime, transactionIndex`
    )
    .all(burialSiteContractId) as BurialSiteContractTransaction[]

  if (connectedDatabase === undefined) {
    database.release()
  }

  if (
    options.includeIntegrations &&
    getConfigProperty('settings.dynamicsGP.integrationIsEnabled')
  ) {
    for (const transaction of lotOccupancyTransactions) {
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

  return lotOccupancyTransactions
}
