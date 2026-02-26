import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js'

import type { BurialSiteType } from '../../types/record.types.js'


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoDeleteBurialSiteTypeResponse =
  { success: boolean; burialSiteTypes: BurialSiteType[] }

export default function handler(
  request: Request<unknown, unknown, { burialSiteTypeId: string }>,
  response: Response<DoDeleteBurialSiteTypeResponse>
): void {
  const success = deleteRecord(
    'BurialSiteTypes',
    request.body.burialSiteTypeId,
    request.session.user as User
  )

  const burialSiteTypes = getCachedBurialSiteTypes()

  response.json({
    success,

    burialSiteTypes
  })
}
