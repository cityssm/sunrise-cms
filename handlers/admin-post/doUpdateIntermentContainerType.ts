import type { Request, Response } from 'express'

import updateIntermentContainerType, {
  type UpdateIntermentContainerTypeForm
} from '../../database/updateIntermentContainerType.js'
import { getCachedIntermentContainerTypes } from '../../helpers/cache/intermentContainerTypes.cache.js'

export default function handler(
  request: Request<unknown, unknown, UpdateIntermentContainerTypeForm>,
  response: Response
): void {
  const success = updateIntermentContainerType(
    request.body,
    request.session.user as User
  )

  const intermentContainerTypes = getCachedIntermentContainerTypes()

  response.json({
    success,

    intermentContainerTypes
  })
}
