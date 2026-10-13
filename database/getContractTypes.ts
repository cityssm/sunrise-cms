import type { DatabaseSync } from 'node:sqlite'

import { getDatabaseConnection } from '../helpers/database.helpers.js'
import type { ContractType } from '../types/record.types.js'

import getContractTypeFields from './getContractTypeFields.js'
import getContractTypePrints from './getContractTypePrints.js'
import updateRecordOrderNumber from './updateRecordOrderNumber.js'

export default function getContractTypes(
  shouldIncludeDeletedRecords = false,
  connectedDatabase?: DatabaseSync
): ContractType[] {
  const database = connectedDatabase ?? getDatabaseConnection()

  const shouldUpdateOrderNumbers = !shouldIncludeDeletedRecords

  const contractTypes = database
    .prepare(/* sql */ `
      SELECT
        contractTypeId,
        contractType,
        isPreneed,
        isAvailableOnPortal,
        orderNumber
      FROM
        ContractTypes ${shouldIncludeDeletedRecords
          ? ''
          : ' WHERE recordDelete_timeMillis IS NULL '}
      ORDER BY
        orderNumber,
        contractType,
        contractTypeId
    `)
    .all() as unknown as ContractType[]

  let expectedOrderNumber = -1

  for (const contractType of contractTypes) {
    expectedOrderNumber += 1

    if (
      shouldUpdateOrderNumbers &&
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
