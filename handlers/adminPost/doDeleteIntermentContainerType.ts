import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import { getCachedIntermentContainerTypes } from '../../helpers/cache/intermentContainerTypes.cache.js'
import type { IntermentContainerType } from '../../types/record.types.js'

export type DoDeleteIntermentContainerTypeResponse = {
  success: boolean

  intermentContainerTypes: IntermentContainerType[]
}

export default function handler(
  request: Request<unknown, unknown, { intermentContainerTypeId: string }>,
  response: Response<DoDeleteIntermentContainerTypeResponse>
): void {
  const success = deleteRecord(
    'IntermentContainerTypes',
    request.body.intermentContainerTypeId,
    request.session.user as User
  )

  const intermentContainerTypes = getCachedIntermentContainerTypes()

  response.json({
    success,

    intermentContainerTypes
  })
}
