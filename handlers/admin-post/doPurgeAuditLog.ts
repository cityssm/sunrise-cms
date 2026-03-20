import type { Request, Response } from 'express'

import purgeAuditLog, {
  type PurgeAuditLogAge
} from '../../database/purgeAuditLog.js'

export type DoPurgeAuditLogResponse =
  | { message: string; success: false }
  | { purgedCount: number; success: true }

const validAges = new Set<PurgeAuditLogAge>([
  'all',
  'ninetyDays',
  'oneYear',
  'thirtyDays'
])

export default function handler(
  request: Request<unknown, unknown, { age?: string }>,
  response: Response<DoPurgeAuditLogResponse>
): void {
  const age = request.body.age as PurgeAuditLogAge | undefined

  if (age === undefined || !validAges.has(age)) {
    response.status(400).json({
      message: 'A valid purge age is required.',
      success: false
    })
    return
  }

  const purgedCount = purgeAuditLog(age)

  response.json({
    purgedCount,
    success: true
  })
}
