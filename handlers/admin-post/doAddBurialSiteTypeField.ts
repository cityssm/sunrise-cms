import type { Request, Response } from 'express'

import addBurialSiteTypeField, {
  type AddBurialSiteTypeFieldForm
} from '../../database/addBurialSiteTypeField.js'
import { getBurialSiteTypes } from '../../helpers/functions.cache.js'

export default function handler(
  request: Request<unknown, unknown, AddBurialSiteTypeFieldForm>,
  response: Response
): void {
  const burialSiteTypeFieldId = addBurialSiteTypeField(
    request.body,
    request.session.user as User
  )

  const burialSiteTypes = getBurialSiteTypes()

  response.json({
    success: true,

    burialSiteTypeFieldId,
    burialSiteTypes
  })
}
