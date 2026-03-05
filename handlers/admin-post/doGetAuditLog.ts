import type { DateString } from '@cityssm/utils-datetime'
import type { Request, Response } from 'express'

import getAuditLog, {
  type AuditLogEntry,
  type AuditLogMainRecordType,
  defaultAuditLogLimit
} from '../../database/getAuditLog.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoGetAuditLogResponse = {
  auditLogEntries: AuditLogEntry[]
  count: number
  offset: number
}

export default function handler(
  request: Request<
    unknown,
    unknown,
    {
      logDateFrom?: '' | DateString
      logDateTo?: '' | DateString
      mainRecordType?: AuditLogMainRecordType
      updateUserName?: string
      limit?: number | string
      offset?: number | string
    }
  >,
  response: Response<DoGetAuditLogResponse>
): void {
  const limit =
    typeof request.body.limit === 'number'
      ? request.body.limit
      : Number.parseInt(
          request.body.limit ?? defaultAuditLogLimit.toString(),
          10
        )

  const offset =
    typeof request.body.offset === 'number'
      ? request.body.offset
      : Number.parseInt(request.body.offset ?? '0', 10)

  const result = getAuditLog(
    {
      logDateFrom: request.body.logDateFrom ?? '',
      logDateTo: request.body.logDateTo ?? '',
      mainRecordType: request.body.mainRecordType ?? '',
      updateUserName: request.body.updateUserName ?? ''
    },
    { limit, offset }
  )

  response.json({
    auditLogEntries: result.auditLogEntries,
    count: result.count,
    offset
  })
}
