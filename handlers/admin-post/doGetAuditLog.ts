import type { Request, Response } from 'express'

import getAuditLog, {
  type AuditLogEntry,
  type AuditLogMainRecordType
} from '../../database/getAuditLog.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoGetAuditLogResponse = { auditLogEntries: AuditLogEntry[] }

export default function handler(
  request: Request<
    unknown,
    unknown,
    {
      logDate?: string
      mainRecordType?: AuditLogMainRecordType
    }
  >,
  response: Response<DoGetAuditLogResponse>
): void {
  const auditLogEntries = getAuditLog({
    logDate: request.body.logDate ?? '',
    mainRecordType: request.body.mainRecordType ?? ''
  })

  response.json({
    auditLogEntries
  })
}
