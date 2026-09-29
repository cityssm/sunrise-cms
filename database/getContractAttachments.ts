import { DatabaseSync } from 'node:sqlite'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { ContractAttachment } from '../types/record.types.js'

export default function getContractAttachments(
  contractId: number | string,
  connectedDatabase?: DatabaseSync
): ContractAttachment[] {
  const database = connectedDatabase ?? new DatabaseSync(sunriseDB)

  const attachments = database
    .prepare(/* sql */ `
      SELECT
        contractAttachmentId,
        attachmentTitle,
        attachmentDetails,
        fileName,
        recordCreate_timeMillis
      FROM
        ContractAttachments
      WHERE
        recordDelete_timeMillis IS NULL
        AND contractId = ?
      ORDER BY
        contractAttachmentId
    `)
    .all(contractId) as unknown as ContractAttachment[]

  if (connectedDatabase === undefined) {
    database.close()
  }

  return attachments
}
