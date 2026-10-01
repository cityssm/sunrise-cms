import { DatabaseSync } from 'node:sqlite'

import { sunriseDB } from '../helpers/database.helpers.js'

export interface AddRelatedContractForm {
  contractId: number | string
  relatedContractId: number | string
}

export default function addRelatedContract(
  relatedContractForm: AddRelatedContractForm,
  connectedDatabase?: DatabaseSync
): boolean {
  const database = connectedDatabase ?? new DatabaseSync(sunriseDB)

  const contractId = Math.trunc(
    Number(relatedContractForm.contractId.toString())
  )

  const relatedContractId = Math.trunc(
    Number(relatedContractForm.relatedContractId.toString())
  )

  database
    .prepare(/* sql */ `
      INSERT INTO
        RelatedContracts (contractIdA, contractIdB)
      VALUES
        (?, ?)
    `)
    .run(
      Math.min(contractId, relatedContractId),
      Math.max(contractId, relatedContractId)
    )

  if (connectedDatabase === undefined) {
    database.close()
  }

  return true
}
