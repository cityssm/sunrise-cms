import type { Request, Response } from 'express'

import getAuditLog, {
  type AuditLogMainRecordType,
  defaultAuditLogLimit
} from '../../database/getAuditLog.js'
import type { AuditLogEntry } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoGetRecordAuditLogResponse = {
  auditLogEntries: AuditLogEntry[]
  count: number
  offset: number
}

export default function handler(
  request: Request<
    unknown,
    unknown,
    {
      mainRecordType?: AuditLogMainRecordType
      mainRecordId?: number | string

      limit?: number | string
      offset?: number | string
    }
  >,
  response: Response<DoGetRecordAuditLogResponse>
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
      mainRecordType: request.body.mainRecordType ?? '',
      mainRecordId: request.body.mainRecordId ?? ''
    },
    { limit, offset }
  )

  response.json({
    auditLogEntries: result.auditLogEntries,
    count: result.count,
    offset
  })
}
