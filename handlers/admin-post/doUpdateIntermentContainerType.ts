import type { Request, Response } from 'express'

import updateIntermentContainerType, {
  type UpdateIntermentContainerTypeForm
} from '../../database/updateIntermentContainerType.js'
import { getCachedIntermentContainerTypes } from '../../helpers/cache/intermentContainerTypes.cache.js'

import type { IntermentContainerType } from '../../types/record.types.js'


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoUpdateIntermentContainerTypeResponse =
  { success: boolean; intermentContainerTypes: IntermentContainerType[] }

export default function handler(
  request: Request<unknown, unknown, UpdateIntermentContainerTypeForm>,
  response: Response<DoUpdateIntermentContainerTypeResponse>
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
