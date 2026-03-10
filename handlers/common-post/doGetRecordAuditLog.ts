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

type RequestBody = {
  mainRecordType?: AuditLogMainRecordType
  mainRecordId?: number | string
  limit?: number | string
  offset?: number | string
}

const forbiddenStatus = 403

/**
 * Returns a route handler that only serves audit log entries for the given
 * `expectedMainRecordType`.  Any request that supplies a different (or
 * missing) `mainRecordType` in the body is rejected with 403 Forbidden.
 */
export default function createHandler(
  expectedMainRecordType: AuditLogMainRecordType
): (request: Request<unknown, unknown, RequestBody>, response: Response) => void {
  return function handler(
    request: Request<unknown, unknown, RequestBody>,
    response: Response
  ): void {
    if (request.body.mainRecordType !== expectedMainRecordType) {
      response
        .status(forbiddenStatus)
        .json({ message: 'Forbidden', success: false })
      return
    }

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
        mainRecordType: expectedMainRecordType,
        mainRecordId: request.body.mainRecordId ?? ''
      },
      { limit, offset }
    )

    response.json({
      auditLogEntries: result.auditLogEntries,
      count: result.count,
      offset
    } satisfies DoGetRecordAuditLogResponse)
  }
}
