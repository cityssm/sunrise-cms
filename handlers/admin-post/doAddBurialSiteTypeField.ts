import type { Request, Response } from 'express'

import addBurialSiteTypeField, {
  type AddBurialSiteTypeFieldForm
} from '../../database/addBurialSiteTypeField.js'
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js'
import type { BurialSiteType } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoAddBurialSiteTypeFieldResponse = {
  success: true

  burialSiteTypeFieldId: number
  burialSiteTypes: BurialSiteType[]
}

export default function handler(
  request: Request<unknown, unknown, AddBurialSiteTypeFieldForm>,
  response: Response<DoAddBurialSiteTypeFieldResponse>
): void {
  const burialSiteTypeFieldId = addBurialSiteTypeField(
    request.body,
    request.session.user as User
  )

  const burialSiteTypes = getCachedBurialSiteTypes()

  response.json({
    success: true,

    burialSiteTypeFieldId,
    burialSiteTypes
  })
}
