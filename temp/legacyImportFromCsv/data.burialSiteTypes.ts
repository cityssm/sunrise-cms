import { getCachedBurialSiteTypesByBurialSiteType } from '../../helpers/cache/burialSiteTypes.cache.js'

export const inGroundBurialSiteTypeId = getCachedBurialSiteTypesByBurialSiteType(
  'In-Ground Grave',
  true
)?.burialSiteTypeId as number

const columbariumBurialSiteTypeId = getCachedBurialSiteTypesByBurialSiteType(
  'Columbarium',
  true
)?.burialSiteTypeId as number

const cremationBurialSiteTypeId = getCachedBurialSiteTypesByBurialSiteType(
  'Crematorium',
  true
)?.burialSiteTypeId as number

const mausoleumBurialSiteTypeId = getCachedBurialSiteTypesByBurialSiteType(
  'Mausoleum',
  true
)?.burialSiteTypeId as number

const nicheWallBurialSiteTypeId = getCachedBurialSiteTypesByBurialSiteType(
  'Niche Wall',
  true
)?.burialSiteTypeId as number

const urnGardenBurialSiteTypeId = getCachedBurialSiteTypesByBurialSiteType(
  'Urn Garden',
  true
)?.burialSiteTypeId as number

export function getBurialSiteTypeId(cemeteryKey: string): number {
  switch (cemeteryKey) {
    case '':
    case '00': {
      return cremationBurialSiteTypeId
    }
    case 'GC':
    case 'HC': {
      return columbariumBurialSiteTypeId
    }
    case 'MA': {
      return mausoleumBurialSiteTypeId
    }
    case 'MN':
    case 'NW': {
      return nicheWallBurialSiteTypeId
    }
    case 'UG': {
      return urnGardenBurialSiteTypeId
    }
    default: {
      return inGroundBurialSiteTypeId
    }
  }
}
