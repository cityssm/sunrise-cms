import {
  dateIntegerToString,
  dateToInteger,
  timeIntegerToPeriodString,
  timeIntegerToString
} from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { Contract } from '../types/record.types.js'

import getContractAttachments from './getContractAttachments.js'
import getContractComments from './getContractComments.js'
import getContractFees from './getContractFees.js'
import getContractFields from './getContractFields.js'
import getContractInterments from './getContractInterments.js'
import getContracts from './getContracts.js'
import getContractServiceTypes from './getContractServiceTypes.js'
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
    .prepare(/* sql */ `
      SELECT
        c.contractId,
        c.contractNumber,
        c.contractTypeId,
        t.contractType,
        t.isPreneed,
        c.burialSiteId,
        b.burialSiteName,
        b.burialSiteTypeId,
        CASE
          WHEN b.recordDelete_timeMillis IS NULL THEN 1
          ELSE 0
        END AS burialSiteIsActive,
        b.cemeteryId,
        cem.cemeteryName,
        c.contractStartDate,
        userFn_dateIntegerToString (c.contractStartDate) AS contractStartDateString,
        c.contractEndDate,
        userFn_dateIntegerToString (c.contractEndDate) AS contractEndDateString,
        c.purchaserName,
        c.purchaserAddress1,
        c.purchaserAddress2,
        c.purchaserCity,
        c.purchaserProvince,
        c.purchaserPostalCode,
        c.purchaserPhoneNumber,
        c.purchaserEmail,
        c.purchaserRelationship,
        c.funeralHomeId,
        c.funeralDirectorName,
        f.funeralHomeKey,
        f.funeralHomeName,
        f.funeralHomeAddress1,
        f.funeralHomeAddress2,
        f.funeralHomeCity,
        f.funeralHomeProvince,
        f.funeralHomePostalCode,
        CASE
          WHEN f.recordDelete_timeMillis IS NULL THEN 1
          ELSE 0
        END AS funeralHomeIsActive,
        c.funeralDate,
        userFn_dateIntegerToString (c.funeralDate) AS funeralDateString,
        c.funeralTime,
        userFn_timeIntegerToString (c.funeralTime) AS funeralTimeString,
        userFn_timeIntegerToPeriodString (c.funeralTime) AS funeralTimePeriodString,
        c.directionOfArrival,
        d.directionOfArrivalDescription,
        c.committalTypeId,
        ct.committalType,
        c.recordUpdate_timeMillis
      FROM
        Contracts c
        LEFT JOIN ContractTypes t ON c.contractTypeId = t.contractTypeId
        LEFT JOIN FuneralHomes f ON c.funeralHomeId = f.funeralHomeId
        LEFT JOIN CommittalTypes ct ON c.committalTypeId = ct.committalTypeId
        LEFT JOIN BurialSites b ON c.burialSiteId = b.burialSiteId
        LEFT JOIN Cemeteries cem ON b.cemeteryId = cem.cemeteryId
        LEFT JOIN CemeteryDirectionsOfArrival d ON b.cemeteryId = d.cemeteryId
        AND c.directionOfArrival = d.directionOfArrival
      WHERE
        c.recordDelete_timeMillis IS NULL
        AND c.contractId = ?
    `)
    .get(contractId) as Contract | undefined

  if (contract !== undefined) {
    const currentDateInteger = dateToInteger(new Date())

    contract.contractIsActive =
      contract.contractEndDate === null ||
      (contract.contractEndDate ?? 0) > currentDateInteger

    contract.contractIsFuture = contract.contractStartDate > currentDateInteger

    contract.contractFields = getContractFields(contractId, database)

    contract.contractInterments = getContractInterments(contractId, database)

    contract.contractServiceTypes = getContractServiceTypes(contractId, database)

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
        offset: 0,

        includeMilestones: true
      },
      database
    )

    contract.workOrders = workOrdersResults.workOrders

    const relatedContractsResults = await getContracts(
      {
        relatedContractId: contractId
      },
      {
        limit: -1,
        offset: 0,

        includeFees: false,
        includeInterments: true,
        includeTransactions: false
      },
      database
    )

    contract.relatedContracts = relatedContractsResults.contracts

    contract.contractAttachments = getContractAttachments(contractId, database)
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return contract
}
