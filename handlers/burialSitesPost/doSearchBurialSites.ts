import type { Request, Response } from 'express'

import getBurialSites, {
  type GetBurialSitesFilters,
  type GetBurialSitesOptions
} from '../../database/getBurialSites.js'
import { getCachedSettingValue } from '../../helpers/cache/settings.cache.js'
import type { BurialSite } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoSearchBurialSitesResponse = {
  burialSites: BurialSite[]
  count: number
  offset: number
}

export default function handler(
  request: Request<
    unknown,
    unknown,
    GetBurialSitesFilters & GetBurialSitesOptions
  >,
  response: Response<DoSearchBurialSitesResponse>
): void {
  const result = getBurialSites(request.body, {
    limit: request.body.limit,
    offset: request.body.offset,

    includeContractCount: true
  })

  const bodyCapacityDefault = Number(
    getCachedSettingValue('burialSiteTypes.bodyCapacityMaxDefault')
  )
  const crematedCapacityDefault = Number(
    getCachedSettingValue('burialSiteTypes.crematedCapacityMaxDefault')
  )

  for (const burialSite of result.burialSites) {
    burialSite.setBodyCapacity =
      burialSite.bodyCapacity ??
      burialSite.bodyCapacityMax ??
      (Number.isFinite(bodyCapacityDefault) ? bodyCapacityDefault : null)
    burialSite.setCrematedCapacity =
      burialSite.crematedCapacity ??
      burialSite.crematedCapacityMax ??
      (Number.isFinite(crematedCapacityDefault)
        ? crematedCapacityDefault
        : null)
  }

  response.json({
    burialSites: result.burialSites,
    count: result.count,
    offset:
      typeof request.body.offset === 'string'
        ? Math.trunc(Number(request.body.offset))
        : request.body.offset
  })
}
