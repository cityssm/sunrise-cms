import sqlite from 'better-sqlite3'

import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import createAuditLogEntries from './createAuditLogEntries.js'

const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled')

export default function addContractAttachment(
  attachment: {
    contractId: number | string

    attachmentDetails?: string
    attachmentTitle?: string

    fileName: string
    filePath: string
  },
  user: User,
  connectedDatabase?: sqlite.Database
): number {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  const result = database
    .prepare(/* sql */ `
      INSERT INTO
        ContractAttachments (
          contractId,
          attachmentTitle,
          attachmentDetails,
          fileName,
          filePath,
          recordCreate_userName,
          recordCreate_timeMillis,
          recordUpdate_userName,
          recordUpdate_timeMillis
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      attachment.contractId,
      attachment.attachmentTitle ?? attachment.fileName,
      attachment.attachmentDetails ?? '',
      attachment.fileName,
      attachment.filePath,
      user.userName,
      rightNowMillis,
      user.userName,
      rightNowMillis
    )

  if (auditLogIsEnabled) {
    const recordAfter = database
      .prepare(
        /* sql */ `SELECT * FROM ContractAttachments WHERE contractAttachmentId = ?`
      )
      .get(result.lastInsertRowid)

    createAuditLogEntries(
      {
        mainRecordType: 'contract',
        mainRecordId: String(attachment.contractId),
        updateTable: 'ContractAttachments',
        recordIndex: String(result.lastInsertRowid)
      },
      [
        {
          property: '*',
          type: 'created',
          from: undefined,
          to: recordAfter
        }
      ],
      user,
      database
    )
  }

  if (connectedDatabase === undefined) {
    database.close()
  }
  return result.lastInsertRowid as number
}
