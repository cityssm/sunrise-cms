import { DatabaseSync } from 'node:sqlite'

import { sunriseDB } from '../helpers/database.helpers.js'

export interface DeleteRelatedContractForm {
  contractId: number | string
  relatedContractId: number | string
}

export default function deleteRelatedContract(
  relatedContractForm: DeleteRelatedContractForm,
  connectedDatabase?: DatabaseSync
): boolean {
  const database = connectedDatabase ?? new DatabaseSync(sunriseDB)

  database
    .prepare(/* sql */ `
      DELETE FROM RelatedContracts
      WHERE
        (
          contractIdA = ?
          AND contractIdB = ?
        )
        OR (
          contractIdA = ?
          AND contractIdB = ?
        )
    `)
    .run(
      relatedContractForm.contractId,
      relatedContractForm.relatedContractId,
      relatedContractForm.relatedContractId,
      relatedContractForm.contractId
    )

  if (connectedDatabase === undefined) {
    database.close()
  }
  return true
}
