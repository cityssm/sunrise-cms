import {
  dateIntegerToString,
  timeIntegerToPeriodString,
  timeIntegerToString
} from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { Contract } from '../types/record.types.js'

import getContractComments from './getContractComments.js'
import getContractFees from './getContractFees.js'
import getContractFields from './getContractFields.js'
import getContractInterments from './getContractInterments.js'
import getContractTransactions from './getContractTransactions.js'
import { getWorkOrders } from './getWorkOrders.js'

export default async function getContract(
  contractId: number | string,
  connectedDatabase?: sqlite.Database
): Promise<Contract | undefined> {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  database.function('userFn_dateIntegerToString', dateIntegerToString)
  database.function('userFn_timeIntegerToString', timeIntegerToString)
  database.function(
    'userFn_timeIntegerToPeriodString',
    timeIntegerToPeriodString
  )

  const contract = database
    .prepare(
      `select o.contractId,
          o.contractTypeId, t.contractType, t.isPreneed,
          o.burialSiteId, l.burialSiteName, l.burialSiteTypeId,
          case when l.recordDelete_timeMillis is null then 1 else 0 end as burialSiteIsActive,
          l.cemeteryId, m.cemeteryName,
          o.contractStartDate, userFn_dateIntegerToString(o.contractStartDate) as contractStartDateString,
          o.contractEndDate, userFn_dateIntegerToString(o.contractEndDate) as contractEndDateString,
          o.purchaserName, o.purchaserAddress1, o.purchaserAddress2,
          o.purchaserCity, o.purchaserProvince, o.purchaserPostalCode,
          o.purchaserPhoneNumber, o.purchaserEmail, o.purchaserRelationship,
          o.funeralHomeId, o.funeralDirectorName, f.funeralHomeKey,
          f.funeralHomeName, f.funeralHomeAddress1, f.funeralHomeAddress2,
          f.funeralHomeCity, f.funeralHomeProvince, f.funeralHomePostalCode,
          o.funeralDate, userFn_dateIntegerToString(o.funeralDate) as funeralDateString,
          o.funeralTime,
          userFn_timeIntegerToString(o.funeralTime) as funeralTimeString,
          userFn_timeIntegerToPeriodString(o.funeralTime) as funeralTimePeriodString,
          o.directionOfArrival,
          o.committalTypeId, c.committalType,
          o.recordUpdate_timeMillis
        from Contracts o
        left join ContractTypes t on o.contractTypeId = t.contractTypeId
        left join FuneralHomes f on o.funeralHomeId = f.funeralHomeId
        left join CommittalTypes c on o.committalTypeId = c.committalTypeId
        left join BurialSites l on o.burialSiteId = l.burialSiteId
        left join Cemeteries m on l.cemeteryId = m.cemeteryId
        where o.recordDelete_timeMillis is null
          and o.contractId = ?`
    )
    .get(contractId) as Contract | undefined

  if (contract !== undefined) {
    contract.contractFields = getContractFields(contractId, database)

    contract.contractInterments = getContractInterments(contractId, database)

    contract.contractComments = getContractComments(contractId, database)
    contract.contractFees = getContractFees(contractId, database)
    contract.contractTransactions = await getContractTransactions(
      contractId,
      { includeIntegrations: true },
      database
    )

    const workOrdersResults = await getWorkOrders(
      {
        contractId
      },
      {
        limit: -1,
        offset: 0
      },
      database
    )

    contract.workOrders = workOrdersResults.workOrders
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return contract
}
