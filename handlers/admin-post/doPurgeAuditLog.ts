import type { Request, Response } from 'express'

import purgeAuditLog, {
  type PurgeAuditLogAge
} from '../../database/purgeAuditLog.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoPurgeAuditLogResponse =
  | { message: string; success: false }
  | { purgedCount: number; success: true }

const validAges: PurgeAuditLogAge[] = [
  'thirtyDays',
  'ninetyDays',
  'oneYear',
  'all'
]

export default function handler(
  request: Request<unknown, unknown, { age?: string }>,
  response: Response<DoPurgeAuditLogResponse>
): void {
  const age = request.body.age as PurgeAuditLogAge | undefined

  if (age === undefined || !validAges.includes(age)) {
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
