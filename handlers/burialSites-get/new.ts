/* eslint-disable unicorn/no-null */

import type { Request, Response } from 'express'

import getCemeteries from '../../database/getCemeteries.js'
import { getCachedBurialSiteStatuses } from '../../helpers/cache/burialSiteStatuses.cache.js'
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js'
import { getBurialSiteImages } from '../../helpers/images.helpers.js'
import type { BurialSite } from '../../types/record.types.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const burialSite: BurialSite = {
    burialSiteId: -1,

    burialSiteName: '',
    burialSiteNameSegment1: '',
    burialSiteNameSegment2: '',
    burialSiteNameSegment3: '',
    burialSiteNameSegment4: '',
    burialSiteNameSegment5: '',

    burialSiteType: '',

    burialSiteLatitude: null,
    burialSiteLongitude: null,

    cemeteryId: null,
    cemeteryName: null,

    contracts: [],

    bodyCapacity: null,
    crematedCapacity: null
  }

  const cemeteries = getCemeteries()

  if (request.query.cemeteryId !== undefined) {
    const cemeteryId = Number.parseInt(request.query.cemeteryId as string, 10)

    const cemetery = cemeteries.find(
      (possibleMatch) => cemeteryId === possibleMatch.cemeteryId
    )

    if (cemetery !== undefined) {
      burialSite.cemeteryId = cemetery.cemeteryId as number
      burialSite.cemeteryName = cemetery.cemeteryName
      burialSite.cemeteryKey = cemetery.cemeteryKey
    }
  }

  const burialSiteImages = await getBurialSiteImages()
  const burialSiteTypes = getCachedBurialSiteTypes()
  const burialSiteStatuses = getCachedBurialSiteStatuses()

  response.render('burialSites/edit', {
    headTitle: 'Create a New Burial Site',

    burialSite,
    isCreate: true,

    burialSiteImages,
    burialSiteStatuses,
    burialSiteTypes,
    cemeteries
  })
}
