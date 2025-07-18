import type { Request, Response } from 'express'

import updateBurialSiteTypeField, {
  type UpdateBurialSiteTypeFieldForm
} from '../../database/updateBurialSiteTypeField.js'
import { getBurialSiteTypes } from '../../helpers/cache.helpers.js'

export default function handler(request: Request, response: Response): void {
  const success = updateBurialSiteTypeField(
    request.body as UpdateBurialSiteTypeFieldForm,
    request.session.user as User
  )

  const burialSiteTypes = getBurialSiteTypes()

  response.json({
    success,

    burialSiteTypes
  })
}
