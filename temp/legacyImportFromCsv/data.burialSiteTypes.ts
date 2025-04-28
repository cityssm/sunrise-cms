import * as cacheFunctions from '../../helpers/functions.cache.js'

const inGroundBurialSiteTypeId =
  cacheFunctions.getBurialSiteTypesByBurialSiteType('In-Ground Grave')
    ?.burialSiteTypeId as number

const columbariumBurialSiteTypeId =
  cacheFunctions.getBurialSiteTypesByBurialSiteType('Columbarium')
    ?.burialSiteTypeId as number

const cremationBurialSiteTypeId =
  cacheFunctions.getBurialSiteTypesByBurialSiteType('Crematorium')
    ?.burialSiteTypeId as number

const mausoleumBurialSiteTypeId =
  cacheFunctions.getBurialSiteTypesByBurialSiteType('Mausoleum')
    ?.burialSiteTypeId as number

const nicheWallBurialSiteTypeId =
  cacheFunctions.getBurialSiteTypesByBurialSiteType('Niche Wall')
    ?.burialSiteTypeId as number

const urnGardenBurialSiteTypeId =
  cacheFunctions.getBurialSiteTypesByBurialSiteType('Urn Garden')
    ?.burialSiteTypeId as number

export function getBurialSiteTypeId(cemeteryKey: string): number {
  switch (cemeteryKey) {
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
