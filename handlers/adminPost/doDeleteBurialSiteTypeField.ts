import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js'
import type { BurialSiteType } from '../../types/record.types.js'

export type DoDeleteBurialSiteTypeFieldResponse = {
  success: boolean

  burialSiteTypes: BurialSiteType[]
}

export default function handler(
  request: Request<unknown, unknown, { burialSiteTypeFieldId: string }>,
  response: Response<DoDeleteBurialSiteTypeFieldResponse>
): void {
  const success = deleteRecord(
    'BurialSiteTypeFields',
    request.body.burialSiteTypeFieldId,
    request.session.user as User
  )

  const burialSiteTypes = getCachedBurialSiteTypes()

  response.json({
    success,

    burialSiteTypes
  })
}
