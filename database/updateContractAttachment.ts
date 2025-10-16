import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export default function updateContractAttachment(
  contractAttachmentId: number | string,
  attachment: {
    attachmentDetails?: string
    attachmentTitle?: string
  },
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  const result = database
    .prepare(
      `update ContractAttachments
        set attachmentTitle = ?,
          attachmentDetails = ?,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?
        where contractAttachmentId = ?
          and recordDelete_timeMillis is null`
    )
    .run(
      attachment.attachmentTitle ?? '',
      attachment.attachmentDetails ?? '',
      user.userName,
      rightNowMillis,
      contractAttachmentId
    )

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result.changes > 0
}