import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { ContractField } from '../types/record.types.js'

export default function getContractFields(
  contractId: number | string,
  connectedDatabase?: sqlite.Database
): ContractField[] {
  const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true })

  const fields = database
    .prepare(/* sql */ `select cf.contractId, cf.contractTypeFieldId,
        cf.fieldValue, f.contractTypeField, f.fieldType, f.fieldValues,
        f.isRequired, f.pattern, f.minLength, f.maxLength,
        f.orderNumber, t.orderNumber as contractTypeOrderNumber
        from ContractFields cf
        left join ContractTypeFields f on cf.contractTypeFieldId = f.contractTypeFieldId
        left join ContractTypes t on f.contractTypeId = t.contractTypeId
        where cf.recordDelete_timeMillis is null
        and cf.contractId = ?

        union
        
        select ? as contractId, f.contractTypeFieldId,
        '' as fieldValue, f.contractTypeField, f.fieldType, f.fieldValues,
        f.isRequired, f.pattern, f.minLength, f.maxLength,
        f.orderNumber, t.orderNumber as contractTypeOrderNumber
        from ContractTypeFields f
        left join ContractTypes t on f.contractTypeId = t.contractTypeId
        where f.recordDelete_timeMillis is null and (
          f.contractTypeId is null
          or f.contractTypeId in (select contractTypeId from Contracts where contractId = ?))
        and f.contractTypeFieldId not in (select contractTypeFieldId from ContractFields where contractId = ? and recordDelete_timeMillis is null)
        order by contractTypeOrderNumber, f.orderNumber, f.contractTypeField`
    )
    .all(contractId, contractId, contractId, contractId) as ContractField[]

  if (connectedDatabase === undefined) {
    database.close()
  }

  return fields
}
