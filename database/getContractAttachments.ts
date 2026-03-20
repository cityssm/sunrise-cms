import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { ContractAttachment } from '../types/record.types.js'

export default function getContractAttachments(
  contractId: number | string,
  connectedDatabase?: sqlite.Database
): ContractAttachment[] {
  const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true })

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
    .all(contractId) as ContractAttachment[]

  if (connectedDatabase === undefined) {
    database.close()
  }

  return attachments
}
