// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-console */
import addCemetery from '../../database/addCemetery.js';
import { getCemeteryByKey } from '../../database/getCemetery.js';
const cemeteryToCemeteryName = {
    '00': 'Crematorium',
    GC: 'New Greenwood - Columbarium',
    HC: 'Holy Sepulchre - Columbarium',
    HS: 'Holy Sepulchre',
    MA: 'Holy Sepulchre - Mausoleum',
    MN: 'Mausoleum Niche',
    NG: 'New Greenwood',
    NW: 'Niche Wall',
    OG: 'Old Greenwood',
    PG: 'Pine Grove',
    UG: 'New Greenwood - Urn Garden',
    WK: 'West Korah',
    WS: 'West Section'
};
const cemeteryCache = new Map();
export async function getCemeteryIdByKey(cemeteryKeyToSearch, user) {
    /*
      if (masterRow.CM_CEMETERY === "HS" &&
          (masterRow.CM_BLOCK === "F" || masterRow.CM_BLOCK === "G" || masterRow.CM_BLOCK === "H" || masterRow.CM_BLOCK === "J")) {
          mapCacheKey += "-" + masterRow.CM_BLOCK;
      }
      */
    const cemeteryKey = cemeteryKeyToSearch ?? '';
    if (cemeteryCache.has(cemeteryKey)) {
        return cemeteryCache.get(cemeteryKey);
    }
    const cemetery = await getCemeteryByKey(cemeteryKey);
    if (cemetery === undefined) {
        console.log(`Creating cemetery: ${cemeteryKey}`);
        const cemeteryId = await addCemetery({
            cemeteryName: cemeteryToCemeteryName[cemeteryKey] ?? cemeteryKey,
            cemeteryDescription: '',
            cemeteryKey,
            cemeterySvg: '',
            cemeteryLatitude: '',
            cemeteryLongitude: '',
            cemeteryAddress1: '',
            cemeteryAddress2: '',
            cemeteryCity: 'Sault Ste. Marie',
            cemeteryPostalCode: '',
            cemeteryProvince: 'ON',
            cemeteryPhoneNumber: ''
        }, user);
        cemeteryCache.set(cemeteryKey, cemeteryId);
    }
    return cemeteryCache.get(cemeteryKey);
}
