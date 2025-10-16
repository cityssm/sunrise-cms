import type { Request, Response } from 'express'

import addBurialSiteTypeField, {
  type AddBurialSiteTypeFieldForm
} from '../../database/addBurialSiteTypeField.js'
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js'

export default function handler(
  request: Request<unknown, unknown, AddBurialSiteTypeFieldForm>,
  response: Response
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
