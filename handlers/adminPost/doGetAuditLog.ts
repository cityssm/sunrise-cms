import type { DateString } from '@cityssm/utils-datetime'
import type { Request, Response } from 'express'

import getAuditLog, {
  type AuditLogMainRecordType,
  defaultAuditLogLimit
} from '../../database/getAuditLog.js'
import type { AuditLogEntry } from '../../types/record.types.js'

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
      updateUsername?: string

      limit?: number | string
      offset?: number | string
    }
  >,
  response: Response<DoGetAuditLogResponse>
): void {
  const limit =
    typeof request.body.limit === 'number'
      ? request.body.limit
      : Math.trunc(
          Number(request.body.limit ?? defaultAuditLogLimit.toString())
        )

  const offset =
    typeof request.body.offset === 'number'
      ? request.body.offset
      : Math.trunc(Number(request.body.offset ?? '0'))

  const result = getAuditLog(
    {
      logDateFrom: request.body.logDateFrom ?? '',
      logDateTo: request.body.logDateTo ?? '',
      mainRecordType: request.body.mainRecordType ?? '',
      updateUsername: request.body.updateUsername ?? ''
    },
    { limit, offset }
  )

  response.json({
    auditLogEntries: result.auditLogEntries,
    count: result.count,
    offset
  })
}
