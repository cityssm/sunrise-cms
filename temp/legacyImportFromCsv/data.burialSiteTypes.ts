import * as cacheFunctions from '../../helpers/functions.cache.js'

const casketBurialSiteTypeId =
  (await cacheFunctions.getBurialSiteTypesByBurialSiteType('Casket Grave'))!
    .burialSiteTypeId

const columbariumBurialSiteTypeId =
  (await cacheFunctions.getBurialSiteTypesByBurialSiteType('Columbarium'))!
    .burialSiteTypeId
const cremationBurialSiteTypeId =
  (await cacheFunctions.getBurialSiteTypesByBurialSiteType('Crematorium'))!
    .burialSiteTypeId
const mausoleumBurialSiteTypeId =
  (await cacheFunctions.getBurialSiteTypesByBurialSiteType('Mausoleum'))!
    .burialSiteTypeId
const nicheWallBurialSiteTypeId =
  (await cacheFunctions.getBurialSiteTypesByBurialSiteType('Niche Wall'))!
    .burialSiteTypeId
const urnGardenBurialSiteTypeId =
  (await cacheFunctions.getBurialSiteTypesByBurialSiteType('Urn Garden'))!
    .burialSiteTypeId

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

  return casketBurialSiteTypeId
}