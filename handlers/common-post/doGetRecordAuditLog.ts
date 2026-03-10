import type { Request, Response } from 'express'

import getAuditLog, {
  type AuditLogMainRecordType,
  defaultAuditLogLimit
} from '../../database/getAuditLog.js'
import type { AuditLogEntry } from '../../types/record.types.js'

export type DoGetRecordAuditLogResponse =
  | {
      success: false

      message: string
    }
  | {
      success: true

      auditLogEntries: AuditLogEntry[]
      count: number
      offset: number
    }

interface RequestBody {
  mainRecordId?: number | string
  mainRecordType?: AuditLogMainRecordType

  limit?: number | string
  offset?: number | string
}

const forbiddenStatus = 403

/**
 * Returns a route handler that only serves audit log entries for the given
 * `expectedMainRecordType`.  Any request that supplies a different (or
 * missing) `mainRecordType` in the body is rejected with 403 Forbidden.
 * @param expectedMainRecordType The main record type that this handler will serve
 * audit log entries for.
 * @returns An Express route handler function.
 */
export default function createHandler(
  expectedMainRecordType: AuditLogMainRecordType
): (
  request: Request<unknown, unknown, RequestBody>,
  response: Response
) => void {
  return function handler(
    request: Request<unknown, unknown, RequestBody>,
    response: Response<DoGetRecordAuditLogResponse>
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
        mainRecordId: request.body.mainRecordId ?? '',
        mainRecordType: expectedMainRecordType
      },
      { limit, offset }
    )

    response.json({
      success: true,

      auditLogEntries: result.auditLogEntries,
      count: result.count,
      offset
    })
  }
}
