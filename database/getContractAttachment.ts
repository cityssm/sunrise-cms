import { DatabaseSync } from 'node:sqlite'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { ContractAttachment } from '../types/record.types.js'

export default function getContractAttachment(
  contractAttachmentId: number | string,
  connectedDatabase?: DatabaseSync
): ContractAttachment | undefined {
  const database = connectedDatabase ?? new DatabaseSync(sunriseDB)

  const attachment = database
    .prepare(/* sql */ `
      SELECT
        contractAttachmentId,
        contractId,
        attachmentTitle,
        attachmentDetails,
        fileName,
        filePath,
        recordCreate_timeMillis
      FROM
        ContractAttachments
      WHERE
        recordDelete_timeMillis IS NULL
        AND contractAttachmentId = ?
    `)
    .get(contractAttachmentId) as unknown as ContractAttachment

  if (connectedDatabase === undefined) {
    database.close()
  }

  return attachment
}
