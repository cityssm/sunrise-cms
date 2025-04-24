import type { Request, Response } from 'express'

import { getBurialSiteTypes } from '../../helpers/functions.cache.js'

export default function handler(
  _request: Request,
  response: Response
): void {
  const burialSiteTypes = getBurialSiteTypes()

  response.render('admin-burialSiteTypes', {
    headTitle: "Burial Site Type Management",
    
    burialSiteTypes
  })
}
