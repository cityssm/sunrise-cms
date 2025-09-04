import type { Request, Response } from 'express'

import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js'

export default function handler(
  _request: Request,
  response: Response
): void {
  const burialSiteTypes = getCachedBurialSiteTypes()

  response.render('admin/burialSiteTypes', {
    headTitle: "Burial Site Type Management",
    
    burialSiteTypes
  })
}
