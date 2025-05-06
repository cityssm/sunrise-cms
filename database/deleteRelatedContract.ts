import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export interface DeleteRelatedContractForm {
  contractId: number | string
  relatedContractId: number | string
}

export default function deleteRelatedContract(
  relatedContractForm: DeleteRelatedContractForm
): boolean {
  const database = sqlite(sunriseDB)

  database
    .prepare(
      `delete from RelatedContracts
        where (contractIdA = ? and contractIdB = ?)
          or (contractIdA = ? and contractIdB = ?)`
    )
    .run(
      relatedContractForm.contractId,
      relatedContractForm.relatedContractId,
      relatedContractForm.relatedContractId,
      relatedContractForm.contractId
    )

  database.close()

  return true
}
