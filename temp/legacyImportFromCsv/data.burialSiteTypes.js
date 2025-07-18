import * as cacheFunctions from '../../helpers/cache.helpers.js';
const inGroundBurialSiteTypeId = cacheFunctions.getBurialSiteTypesByBurialSiteType('In-Ground Grave', true)
    ?.burialSiteTypeId;
const columbariumBurialSiteTypeId = cacheFunctions.getBurialSiteTypesByBurialSiteType('Columbarium', true)
    ?.burialSiteTypeId;
const cremationBurialSiteTypeId = cacheFunctions.getBurialSiteTypesByBurialSiteType('Crematorium', true)
    ?.burialSiteTypeId;
const mausoleumBurialSiteTypeId = cacheFunctions.getBurialSiteTypesByBurialSiteType('Mausoleum', true)
    ?.burialSiteTypeId;
const nicheWallBurialSiteTypeId = cacheFunctions.getBurialSiteTypesByBurialSiteType('Niche Wall', true)
    ?.burialSiteTypeId;
const urnGardenBurialSiteTypeId = cacheFunctions.getBurialSiteTypesByBurialSiteType('Urn Garden', true)
    ?.burialSiteTypeId;
export function getBurialSiteTypeId(cemeteryKey) {
    switch (cemeteryKey) {
        case '':
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
