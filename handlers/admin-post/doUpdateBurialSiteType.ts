import type { Request, Response } from 'express'

import updateBurialSiteType, {
  type UpdateBurialSiteTypeForm
} from '../../database/updateBurialSiteType.js'
import { getBurialSiteTypes } from '../../helpers/functions.cache.js'

export default function handler(
  request: Request<unknown, unknown, UpdateBurialSiteTypeForm>,
  response: Response
): void {
  const success = updateBurialSiteType(
    request.body,
    request.session.user as User
  )

  const burialSiteTypes = getBurialSiteTypes()

  response.json({
    success,

    burialSiteTypes
  })
}
