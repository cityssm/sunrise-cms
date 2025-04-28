import * as cacheFunctions from '../../helpers/functions.cache.js';
const inGroundBurialSiteTypeId = cacheFunctions.getBurialSiteTypesByBurialSiteType('In-Ground Grave')
    ?.burialSiteTypeId;
const columbariumBurialSiteTypeId = cacheFunctions.getBurialSiteTypesByBurialSiteType('Columbarium')
    ?.burialSiteTypeId;
const cremationBurialSiteTypeId = cacheFunctions.getBurialSiteTypesByBurialSiteType('Crematorium')
    ?.burialSiteTypeId;
const mausoleumBurialSiteTypeId = cacheFunctions.getBurialSiteTypesByBurialSiteType('Mausoleum')
    ?.burialSiteTypeId;
const nicheWallBurialSiteTypeId = cacheFunctions.getBurialSiteTypesByBurialSiteType('Niche Wall')
    ?.burialSiteTypeId;
const urnGardenBurialSiteTypeId = cacheFunctions.getBurialSiteTypesByBurialSiteType('Urn Garden')
    ?.burialSiteTypeId;
export function getBurialSiteTypeId(cemeteryKey) {
    switch (cemeteryKey) {
        case '00': {
            return cremationBurialSiteTypeId;
        }
        case 'GC':
        case 'HC': {
            return columbariumBurialSiteTypeId;
        }
        case 'MA': {
            return mausoleumBurialSiteTypeId;
        }
        case 'MN':
        case 'NW': {
            return nicheWallBurialSiteTypeId;
        }
        case 'UG': {
            return urnGardenBurialSiteTypeId;
        }
    }
    return inGroundBurialSiteTypeId;
}
