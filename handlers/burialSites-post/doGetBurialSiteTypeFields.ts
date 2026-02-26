import type { Request, Response } from 'express'

import { getCachedBurialSiteTypeById } from '../../helpers/cache/burialSiteTypes.cache.js'

import type { BurialSiteTypeField } from '../../types/record.types.js'


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoGetBurialSiteTypeFieldsResponse =
  { burialSiteTypeFields: BurialSiteTypeField[] }

export default function handler(
  request: Request<unknown, unknown, { burialSiteTypeId: string }>,
  response: Response<DoGetBurialSiteTypeFieldsResponse>
): void {
  const burialSiteType = getCachedBurialSiteTypeById(
    Number.parseInt(request.body.burialSiteTypeId, 10)
  )

  response.json({
    burialSiteTypeFields: burialSiteType?.burialSiteTypeFields ?? []
  })
}
