import type { Request, Response } from 'express'

import { getBurialSiteTypes } from '../../helpers/functions.cache.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export default async function handler(
  _request: Request,
  response: Response
): Promise<void> {
  const lotTypes = await getBurialSiteTypes()

  response.render('admin-lotTypes', {
    headTitle: `${getConfigProperty('aliases.lot')} Type Management`,
    lotTypes
  })
}
