import type { DatabaseSync } from 'node:sqlite'

import { getDatabaseConnection } from '../helpers/database.helpers.js'
import type { ContractAttachment } from '../types/record.types.js'

export default function getContractAttachments(
  contractId: number | string,
  connectedDatabase?: DatabaseSync
): ContractAttachment[] {
  const database = connectedDatabase ?? getDatabaseConnection()

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
