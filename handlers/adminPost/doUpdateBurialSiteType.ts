import type { Request, Response } from 'express'

import updateBurialSiteType, {
  type UpdateBurialSiteTypeForm
} from '../../database/updateBurialSiteType.js'
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js'
import type { BurialSiteType } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoUpdateBurialSiteTypeResponse = {
  success: boolean

  burialSiteTypes: BurialSiteType[]
}

export default function handler(
  request: Request<unknown, unknown, UpdateBurialSiteTypeForm>,
  response: Response<DoUpdateBurialSiteTypeResponse>
): void {
  const success = updateBurialSiteType(
    request.body,
    request.session.user as User
  )

  const burialSiteTypes = getCachedBurialSiteTypes()

  response.json({
    success,

    burialSiteTypes
  })
}
