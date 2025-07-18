import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import { getIntermentContainerTypes } from '../../helpers/cache.helpers.js'

export default function handler(
  request: Request<unknown, unknown, { intermentContainerTypeId: string }>,
  response: Response
): void {
  const success = deleteRecord(
    'IntermentContainerTypes',
    request.body.intermentContainerTypeId as string,
    request.session.user as User
  )

  const intermentContainerTypes = getIntermentContainerTypes()

  response.json({
    success,

    intermentContainerTypes
  })
}
