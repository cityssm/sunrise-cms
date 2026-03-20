import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { ContractAttachment } from '../types/record.types.js'

export default function getContractAttachment(
  contractAttachmentId: number | string,
  connectedDatabase?: sqlite.Database
): ContractAttachment | undefined {
  const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true })

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
    .get(contractAttachmentId) as ContractAttachment

  if (connectedDatabase === undefined) {
    database.close()
  }

  return attachment
}
