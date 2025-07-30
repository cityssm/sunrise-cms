import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { ContractAttachment } from '../types/record.types.js'

export default function getContractAttachment(
  contractAttachmentId: number | string
): ContractAttachment | undefined {
  const database = sqlite(sunriseDB, { readonly: true })

  const attachment = database
    .prepare(
      `select contractAttachmentId, contractId,
          attachmentTitle, attachmentDetails,
          fileName, filePath,
          recordCreate_timeMillis
        from ContractAttachments
        where recordDelete_timeMillis is null
          and contractAttachmentId = ?`
    )
    .get(contractAttachmentId) as ContractAttachment

  database.close()

  return attachment
}
