import type { Request, Response } from 'express'

import updateBurialSiteTypeField, {
  type UpdateBurialSiteTypeFieldForm
} from '../../database/updateBurialSiteTypeField.js'
import { getBurialSiteTypes } from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = await updateBurialSiteTypeField(
    request.body as UpdateBurialSiteTypeFieldForm,
    request.session.user as User
  )

  const burialSiteTypes = await getBurialSiteTypes()

  response.json({
    success,
    burialSiteTypes
  })
}
