import type { Request, Response } from 'express'

import updateBurialSiteTypeField, {
  type UpdateBurialSiteTypeFieldForm
} from '../../database/updateBurialSiteTypeField.js'
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js'

export default function handler(request: Request, response: Response): void {
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
