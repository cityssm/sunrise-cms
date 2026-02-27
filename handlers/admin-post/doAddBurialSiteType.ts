import type { Request, Response } from 'express'

import addBurialSiteType, {
  type AddBurialSiteTypeForm
} from '../../database/addBurialSiteType.js'
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js'
import type { BurialSiteType } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoAddBurialSiteTypeResponse = {
  success: true

  burialSiteTypeId: number
  burialSiteTypes: BurialSiteType[]
}

export default function handler(
  request: Request<unknown, unknown, AddBurialSiteTypeForm>,
  response: Response<DoAddBurialSiteTypeResponse>
): void {
  const burialSiteTypeId = addBurialSiteType(
    request.body,
    request.session.user as User
  )

  const burialSiteTypes = getCachedBurialSiteTypes()

  response.json({
    success: true,

    burialSiteTypeId,
    burialSiteTypes
  })
}
