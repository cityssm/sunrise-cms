import type { Request, Response } from 'express'

import addBurialSiteType, {
  type AddBurialSiteTypeForm
} from '../../database/addBurialSiteType.js'
import { getBurialSiteTypes } from '../../helpers/cache.helpers.js'

export default function handler(
  request: Request<unknown, unknown, AddBurialSiteTypeForm>,
  response: Response
): void {
  const burialSiteTypeId = addBurialSiteType(
    request.body,
    request.session.user as User
  )

  const burialSiteTypes = getBurialSiteTypes()

  response.json({
    success: true,

    burialSiteTypeId,
    burialSiteTypes
  })
}
