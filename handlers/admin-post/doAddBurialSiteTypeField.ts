import type { Request, Response } from 'express'

import addBurialSiteTypeField, {
  type AddBurialSiteTypeFieldForm
} from '../../database/addBurialSiteTypeField.js'
import { getBurialSiteTypes } from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request<unknown, unknown, AddBurialSiteTypeFieldForm>,
  response: Response
): Promise<void> {
  const burialSiteTypeFieldId = await addBurialSiteTypeField(
    request.body,
    request.session.user as User
  )

  const burialSiteTypes = await getBurialSiteTypes()

  response.json({
    success: true,

    burialSiteTypeFieldId,
    burialSiteTypes
  })
}
