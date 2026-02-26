import type { Request, Response } from 'express'

import updateBurialSiteTypeField, {
  type UpdateBurialSiteTypeFieldForm
} from '../../database/updateBurialSiteTypeField.js'
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js'

import type { BurialSiteType } from '../../types/record.types.js'


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoUpdateBurialSiteTypeFieldResponse =
  { success: boolean; burialSiteTypes: BurialSiteType[] }

export default function handler(request: Request, response: Response<DoUpdateBurialSiteTypeFieldResponse>): void {
  const success = updateBurialSiteTypeField(
    request.body as UpdateBurialSiteTypeFieldForm,
    request.session.user as User
  )

  const burialSiteTypes = getCachedBurialSiteTypes()

  response.json({
    success,

    burialSiteTypes
  })
}
