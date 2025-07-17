// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-magic-numbers */

import fillBlockRange, {
  calculateCartesianProductLength
} from '@cityssm/fill-block-range'
import sqlite from 'better-sqlite3'
import cartesianProduct from 'just-cartesian-product'

import { buildBurialSiteName } from '../helpers/burialSites.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import getCemetery from './getCemetery.js'

export interface GetBurialSiteNamesByRangeForm {
  burialSiteNameSegment1_from?: string
  burialSiteNameSegment1_to?: string

  burialSiteNameSegment2_from?: string
  burialSiteNameSegment2_to?: string

  burialSiteNameSegment3_from?: string
  burialSiteNameSegment3_to?: string

  burialSiteNameSegment4_from?: string
  burialSiteNameSegment4_to?: string

  burialSiteNameSegment5_from?: string
  burialSiteNameSegment5_to?: string

  cemeteryId: number | string
}

export type GetBurialSiteNamesByRangeResult = Array<{
  burialSiteId?: number
  burialSiteName: string
  burialSiteNameSegment1: string
  burialSiteNameSegment2: string
  burialSiteNameSegment3: string
  burialSiteNameSegment4: string
  burialSiteNameSegment5: string
}>

const segmentCount = 5

export const burialSiteNameRangeLimit = 1000

export default function getBurialSiteNamesByRange(
  rangeForm: GetBurialSiteNamesByRangeForm
): GetBurialSiteNamesByRangeResult {
  const segmentRanges: string[][] = []

  try {
    for (let segmentIndex = 1; segmentIndex <= segmentCount; segmentIndex++) {
      segmentRanges.push([''])

      const segmentFrom = rangeForm[
        `burialSiteNameSegment${segmentIndex}_from`
      ] as string | undefined

      let segmentTo = rangeForm[`burialSiteNameSegment${segmentIndex}_to`] as
        | string
        | undefined

      if (segmentFrom === undefined || segmentTo === undefined) {
        continue
      }

      if (segmentTo === '') {
        segmentTo = segmentFrom
      }

      const blockRange = fillBlockRange(segmentFrom, segmentTo, {
        limit: burialSiteNameRangeLimit
      })

      if (blockRange.length > 0) {
        segmentRanges[segmentIndex - 1] = blockRange
      }
    }
  } catch {
    return []
  }

  if (calculateCartesianProductLength(segmentRanges) > burialSiteNameRangeLimit) {
    return []
  }

  const burialSiteNameSegments = cartesianProduct(segmentRanges) as string[][]

  const results: GetBurialSiteNamesByRangeResult = []

  const database = sqlite(sunriseDB)

  const cemetery =
    rangeForm.cemeteryId === ''
      ? undefined
      : getCemetery(rangeForm.cemeteryId, database)

  for (const burialSiteNameSegmentsArray of burialSiteNameSegments) {
    const burialSiteName = buildBurialSiteName(cemetery?.cemeteryKey, {
      burialSiteNameSegment1: burialSiteNameSegmentsArray[0],
      burialSiteNameSegment2: burialSiteNameSegmentsArray[1],
      burialSiteNameSegment3: burialSiteNameSegmentsArray[2],
      burialSiteNameSegment4: burialSiteNameSegmentsArray[3],
      burialSiteNameSegment5: burialSiteNameSegmentsArray[4]
    })

    const burialSiteId = database
      .prepare(
        `select burialSiteId
          from BurialSites
          where burialSiteName = ?
          and recordDelete_timeMillis is null`
      )
      .pluck()
      .get(burialSiteName) as number | undefined

    results.push({
      burialSiteId,
      burialSiteName,
      burialSiteNameSegment1: burialSiteNameSegmentsArray[0],
      burialSiteNameSegment2: burialSiteNameSegmentsArray[1],
      burialSiteNameSegment3: burialSiteNameSegmentsArray[2],
      burialSiteNameSegment4: burialSiteNameSegmentsArray[3],
      burialSiteNameSegment5: burialSiteNameSegmentsArray[4]
    })
  }

  database.close()

  return results
}
