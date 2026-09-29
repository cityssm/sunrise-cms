import { type SQLInputValue, DatabaseSync } from 'node:sqlite'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { ContractTypeField } from '../types/record.types.js'

import updateRecordOrderNumber from './updateRecordOrderNumber.js'

export default function getContractTypeFields(
  contractTypeId?: number,
  connectedDatabase?: DatabaseSync
): ContractTypeField[] {
  const database = connectedDatabase ?? new DatabaseSync(sunriseDB)

  const sqlParameters: SQLInputValue[] = []

  if (contractTypeId !== undefined && contractTypeId !== -1) {
    sqlParameters.push(contractTypeId)
  }

  const contractTypeFields = database
    // eslint-disable-next-line sqlite-security/no-unsafe-query
    .prepare(/* sql */ `
      SELECT
        contractTypeFieldId,
        contractTypeField,
        fieldType,
        fieldValues,
        isRequired,
        pattern,
        minLength,
        maxLength,
        orderNumber
      FROM
        ContractTypeFields
      WHERE
        recordDelete_timeMillis IS NULL ${(contractTypeId ?? -1) === -1
          ? ' AND contractTypeId IS NULL'
          : ' AND contractTypeId = ?'}
      ORDER BY
        orderNumber,
        contractTypeField
    `)
    .all(...sqlParameters) as unknown as ContractTypeField[]

  let expectedOrderNumber = 0

  for (const contractTypeField of contractTypeFields) {
    if (contractTypeField.orderNumber !== expectedOrderNumber) {
      updateRecordOrderNumber(
        'ContractTypeFields',
        contractTypeField.contractTypeFieldId,
        expectedOrderNumber,
        database
      )

      contractTypeField.orderNumber = expectedOrderNumber
    }

    expectedOrderNumber += 1
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return contractTypeFields
}
