import type { Request, Response } from 'express'

import updateIntermentContainerType, {
  type UpdateIntermentContainerTypeForm
} from '../../database/updateIntermentContainerType.js'
import { getIntermentContainerTypes } from '../../helpers/functions.cache.js'

export default function handler(
  request: Request<unknown, unknown, UpdateIntermentContainerTypeForm>,
  response: Response
): void {
  const success = updateIntermentContainerType(
    request.body,
    request.session.user as User
  )

  const intermentContainerTypes = getIntermentContainerTypes()

  response.json({
    success,

    intermentContainerTypes
  })
}
