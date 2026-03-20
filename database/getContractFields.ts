import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { ContractField } from '../types/record.types.js'

export default function getContractFields(
  contractId: number | string,
  connectedDatabase?: sqlite.Database
): ContractField[] {
  const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true })

  const fields = database
    .prepare(/* sql */ `
      SELECT
        cf.contractId,
        cf.contractTypeFieldId,
        cf.fieldValue,
        f.contractTypeField,
        f.fieldType,
        f.fieldValues,
        f.isRequired,
        f.pattern,
        f.minLength,
        f.maxLength,
        f.orderNumber,
        t.orderNumber AS contractTypeOrderNumber
      FROM
        ContractFields cf
        LEFT JOIN ContractTypeFields f ON cf.contractTypeFieldId = f.contractTypeFieldId
        LEFT JOIN ContractTypes t ON f.contractTypeId = t.contractTypeId
      WHERE
        cf.recordDelete_timeMillis IS NULL
        AND cf.contractId = ?
      UNION
      SELECT
        ? AS contractId,
        f.contractTypeFieldId,
        '' AS fieldValue,
        f.contractTypeField,
        f.fieldType,
        f.fieldValues,
        f.isRequired,
        f.pattern,
        f.minLength,
        f.maxLength,
        f.orderNumber,
        t.orderNumber AS contractTypeOrderNumber
      FROM
        ContractTypeFields f
        LEFT JOIN ContractTypes t ON f.contractTypeId = t.contractTypeId
      WHERE
        f.recordDelete_timeMillis IS NULL
        AND (
          f.contractTypeId IS NULL
          OR f.contractTypeId IN (
            SELECT
              contractTypeId
            FROM
              Contracts
            WHERE
              contractId = ?
          )
        )
        AND f.contractTypeFieldId NOT IN (
          SELECT
            contractTypeFieldId
          FROM
            ContractFields
          WHERE
            contractId = ?
            AND recordDelete_timeMillis IS NULL
        )
      ORDER BY
        contractTypeOrderNumber,
        f.orderNumber,
        f.contractTypeField
    `)
    .all(contractId, contractId, contractId, contractId) as ContractField[]

  if (connectedDatabase === undefined) {
    database.close()
  }

  return fields
}
