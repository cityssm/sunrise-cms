import type { Request, Response } from 'express'

import addIntermentContainerType, {
  type AddIntermentContainerTypeForm
} from '../../database/addIntermentContainerType.js'
import { getIntermentContainerTypes } from '../../helpers/functions.cache.js'

export default function handler(
  request: Request<unknown, unknown, AddIntermentContainerTypeForm>,
  response: Response
): void {
  const intermentContainerTypeId = addIntermentContainerType(
    request.body,
    request.session.user as User
  )

  const intermentContainerTypes = getIntermentContainerTypes()

  response.json({
    success: true,

    intermentContainerTypeId,
    intermentContainerTypes
  })
}
