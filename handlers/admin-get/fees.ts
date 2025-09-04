import type { Request, Response } from 'express'

import getFeeCategories from '../../database/getFeeCategories.js'
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js'
import { getCachedContractTypes } from '../../helpers/cache/contractTypes.cache.js'

export default function handler(_request: Request, response: Response): void {
  const feeCategories = getFeeCategories(
    {},
    {
      includeFees: true
    }
  )

  const contractTypes = getCachedContractTypes()
  const burialSiteTypes = getCachedBurialSiteTypes()

  response.render('admin/fees', {
    headTitle: 'Fee Management',

    burialSiteTypes,
    contractTypes,
    feeCategories
  })
}
