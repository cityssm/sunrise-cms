import type { Request, Response } from 'express'

import { getBurialSiteTypes } from '../../helpers/functions.cache.js'

export default async function handler(
  _request: Request,
  response: Response
): Promise<void> {
  const lotTypes = await getBurialSiteTypes()

  response.render('admin-burialSiteTypes', {
    headTitle: `Burial Site Type Management`,
    lotTypes
  })
}
