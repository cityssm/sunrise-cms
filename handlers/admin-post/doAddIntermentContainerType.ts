import type { Request, Response } from 'express'

import addIntermentContainerType, {
  type AddIntermentContainerTypeForm
} from '../../database/addIntermentContainerType.js'
import { getCachedIntermentContainerTypes } from '../../helpers/cache/intermentContainerTypes.cache.js'
import type { IntermentContainerType } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoAddIntermentContainerTypeResponse = {
  success: true

  intermentContainerTypeId: number
  intermentContainerTypes: IntermentContainerType[]
}

export default function handler(
  request: Request<unknown, unknown, AddIntermentContainerTypeForm>,
  response: Response<DoAddIntermentContainerTypeResponse>
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
