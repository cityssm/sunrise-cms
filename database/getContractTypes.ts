import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { ContractType } from '../types/record.types.js'

import getContractTypeFields from './getContractTypeFields.js'
import getContractTypePrints from './getContractTypePrints.js'
import { updateRecordOrderNumber } from './updateRecordOrderNumber.js'

export default function getContractTypes(
  includeDeleted = false
, connectedDatabase?: sqlite.Database): ContractType[] {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const updateOrderNumbers = !includeDeleted

  const contractTypes = database
    .prepare(
      `select contractTypeId, contractType, isPreneed, orderNumber
        from ContractTypes
        ${includeDeleted ? '' : ' where recordDelete_timeMillis is null '} 
        order by orderNumber, contractType, contractTypeId`
    )
    .all() as ContractType[]

  let expectedOrderNumber = -1

  for (const contractType of contractTypes) {
    expectedOrderNumber += 1

    if (
      updateOrderNumbers &&
      contractType.orderNumber !== expectedOrderNumber
    ) {
      updateRecordOrderNumber(
        'ContractTypes',
        contractType.contractTypeId,
        expectedOrderNumber,
        database
      )

      contractType.orderNumber = expectedOrderNumber
    }

    contractType.contractTypeFields = getContractTypeFields(
      contractType.contractTypeId,
      database
    )

    contractType.contractTypePrints = getContractTypePrints(
      contractType.contractTypeId,
      database
    )
  }

  if (connectedDatabase === undefined) {


    database.close()


  }
  return contractTypes
}
