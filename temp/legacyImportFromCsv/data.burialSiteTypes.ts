import * as cacheFunctions from '../../helpers/cache.helpers.js'

const inGroundBurialSiteTypeId =
  cacheFunctions.getBurialSiteTypesByBurialSiteType('In-Ground Grave', true)
    ?.burialSiteTypeId as number

const columbariumBurialSiteTypeId =
  cacheFunctions.getBurialSiteTypesByBurialSiteType('Columbarium', true)
    ?.burialSiteTypeId as number

const cremationBurialSiteTypeId =
  cacheFunctions.getBurialSiteTypesByBurialSiteType('Crematorium', true)
    ?.burialSiteTypeId as number

const mausoleumBurialSiteTypeId =
  cacheFunctions.getBurialSiteTypesByBurialSiteType('Mausoleum', true)
    ?.burialSiteTypeId as number

const nicheWallBurialSiteTypeId =
  cacheFunctions.getBurialSiteTypesByBurialSiteType('Niche Wall', true)
    ?.burialSiteTypeId as number

const urnGardenBurialSiteTypeId =
  cacheFunctions.getBurialSiteTypesByBurialSiteType('Urn Garden', true)
    ?.burialSiteTypeId as number

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
  }

  return inGroundBurialSiteTypeId
}
