import type { Request, Response } from 'express'

import addIntermentContainerType, {
  type AddIntermentContainerTypeForm
} from '../../database/addIntermentContainerType.js'
import { getCachedIntermentContainerTypes } from '../../helpers/cache/intermentContainerTypes.cache.js'

export default function handler(
  request: Request<unknown, unknown, AddIntermentContainerTypeForm>,
  response: Response
): void {
  const intermentContainerTypeId = addIntermentContainerType(
    request.body,
    request.session.user as User
  )

  const intermentContainerTypes = getCachedIntermentContainerTypes()

  response.json({
    success: true,

    intermentContainerTypeId,
    intermentContainerTypes
  })
}
