import type { Request, Response } from 'express'

import getRecordUpdateLog, {
  type RecordType,
  type RecordUpdateLog,
  defaultRecordLimit
} from '../../database/getRecordUpdateLog.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoGetRecordUpdateLogResponse = { updateLog: RecordUpdateLog[] }

export default function handler(
  request: Request<
    unknown,
    unknown,
    {
      limit?: number | string
      offset?: number | string
      recordType?: '' | RecordType
      sortBy?: 'recordCreate_timeMillis' | 'recordUpdate_timeMillis'
      sortDirection?: 'asc' | 'desc'
    }
  >,
  response: Response<DoGetRecordUpdateLogResponse>
): void {
  const updateLog = getRecordUpdateLog(
    {
      recordType: request.body.recordType ?? ''
    },
    {
      limit:
        typeof request.body.limit === 'number'
          ? request.body.limit
          : Number.parseInt(
              request.body.limit ?? defaultRecordLimit.toString(),
              10
            ),
      offset:
        typeof request.body.offset === 'number'
          ? request.body.offset
          : Number.parseInt(request.body.offset ?? '0', 10),
      sortBy: request.body.sortBy ?? 'recordUpdate_timeMillis',
      sortDirection: request.body.sortDirection ?? 'desc'
    }
  )

  response.json({
    updateLog
  })
}
