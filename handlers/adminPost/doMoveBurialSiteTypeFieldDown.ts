import type { Request, Response } from 'express'

import {
  moveBurialSiteTypeFieldDown,
  moveBurialSiteTypeFieldDownToBottom
} from '../../database/moveBurialSiteTypeField.js'
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js'
import type { BurialSiteType } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoMoveBurialSiteTypeFieldDownResponse = {
  success: boolean

  burialSiteTypes: BurialSiteType[]
}

export default function handler(
  request: Request<
    unknown,
    unknown,
    { burialSiteTypeFieldId: string; moveToEnd: '0' | '1' }
  >,
  response: Response<DoMoveBurialSiteTypeFieldDownResponse>
): void {
  const success =
    request.body.moveToEnd === '1'
      ? moveBurialSiteTypeFieldDownToBottom(request.body.burialSiteTypeFieldId)
      : moveBurialSiteTypeFieldDown(request.body.burialSiteTypeFieldId)

  const burialSiteTypes = getCachedBurialSiteTypes()

  response.json({
    success,

    burialSiteTypes
  })
}
