import { getCachedBurialSiteTypesByBurialSiteType } from '../../helpers/cache/burialSiteTypes.cache.js';
const inGroundBurialSiteTypeId = getCachedBurialSiteTypesByBurialSiteType('In-Ground Grave', true)?.burialSiteTypeId;
const columbariumBurialSiteTypeId = getCachedBurialSiteTypesByBurialSiteType('Columbarium', true)?.burialSiteTypeId;
const cremationBurialSiteTypeId = getCachedBurialSiteTypesByBurialSiteType('Crematorium', true)?.burialSiteTypeId;
const mausoleumBurialSiteTypeId = getCachedBurialSiteTypesByBurialSiteType('Mausoleum', true)?.burialSiteTypeId;
const nicheWallBurialSiteTypeId = getCachedBurialSiteTypesByBurialSiteType('Niche Wall', true)?.burialSiteTypeId;
const urnGardenBurialSiteTypeId = getCachedBurialSiteTypesByBurialSiteType('Urn Garden', true)?.burialSiteTypeId;
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
        default: {
            return inGroundBurialSiteTypeId;
        }
    }
}
