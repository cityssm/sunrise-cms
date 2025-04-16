// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-console */
import addCemetery from '../../database/addCemetery.js';
import { getCemeteryByKey } from '../../database/getCemetery.js';
const cemeteryKeyToCemetery = {
    '00': {
        cemeteryName: 'Crematorium',
        cemeteryDescription: 'At New Greenwood Cemetery',
        cemeteryKey: '00',
        cemeterySvg: '',
        cemeteryLatitude: '46.56620754',
        cemeteryLongitude: '-84.35110152',
        cemeteryAddress1: '27 Fourth Line East',
        cemeteryAddress2: '',
        cemeteryCity: 'Sault Ste. Marie',
        cemeteryPostalCode: 'P6A 5K8',
        cemeteryProvince: 'ON',
        cemeteryPhoneNumber: '705-759-5336',
        parentCemeteryId: ''
    },
    GC: {
        cemeteryName: 'New Greenwood - Columbarium',
        cemeteryDescription: 'At New Greenwood Cemetery',
        cemeteryKey: 'GC',
        cemeterySvg: 'newGreenwood-urnGarden.svg',
        cemeteryLatitude: '46.56603051',
        cemeteryLongitude: '-84.35148239',
        cemeteryAddress1: 'Fourth Line East',
        cemeteryAddress2: '',
        cemeteryCity: 'Sault Ste. Marie',
        cemeteryPostalCode: '',
        cemeteryProvince: 'ON',
        cemeteryPhoneNumber: '',
        parentCemeteryId: ''
    },
    HC: {
        cemeteryName: 'Holy Sepulchre - Columbarium',
        cemeteryDescription: 'At Holy Sepulchre Cemetery',
        cemeteryKey: 'HC',
        cemeterySvg: '',
        cemeteryLatitude: '',
        cemeteryLongitude: '',
        cemeteryAddress1: 'Fourth Line East',
        cemeteryAddress2: '',
        cemeteryCity: 'Sault Ste. Marie',
        cemeteryPostalCode: '',
        cemeteryProvince: 'ON',
        cemeteryPhoneNumber: '',
        parentCemeteryId: ''
    },
    HS: {
        cemeteryName: 'Holy Sepulchre',
        cemeteryDescription: 'North of Fourth Line at the intersection of Fourth Line and Peoples Road.',
        cemeteryKey: 'HS',
        cemeterySvg: 'holySepulchre-overview.svg',
        cemeteryLatitude: '46.56847938',
        cemeteryLongitude: '-84.34822083',
        cemeteryAddress1: 'Fourth Line East',
        cemeteryAddress2: '',
        cemeteryCity: 'Sault Ste. Marie',
        cemeteryPostalCode: '',
        cemeteryProvince: 'ON',
        cemeteryPhoneNumber: '',
        parentCemeteryId: ''
    },
    MA: {
        cemeteryName: 'Holy Sepulchre - Mausoleum',
        cemeteryDescription: 'At Holy Sepulchre Cemetery',
        cemeteryKey: 'MA',
        cemeterySvg: '',
        cemeteryLatitude: '46.56864165',
        cemeteryLongitude: '-84.34622526',
        cemeteryAddress1: 'Fourth Line East',
        cemeteryAddress2: '',
        cemeteryCity: 'Sault Ste. Marie',
        cemeteryPostalCode: '',
        cemeteryProvince: 'ON',
        cemeteryPhoneNumber: '',
        parentCemeteryId: ''
    },
    MN: {
        cemeteryName: 'Mausoleum Niche',
        cemeteryDescription: 'At Holy Sepulchre Cemetery',
        cemeteryKey: 'MN',
        cemeterySvg: '',
        cemeteryLatitude: '',
        cemeteryLongitude: '',
        cemeteryAddress1: 'Fourth Line East',
        cemeteryAddress2: '',
        cemeteryCity: 'Sault Ste. Marie',
        cemeteryPostalCode: '',
        cemeteryProvince: 'ON',
        cemeteryPhoneNumber: '',
        parentCemeteryId: ''
    },
    NG: {
        cemeteryName: 'New Greenwood',
        cemeteryDescription: 'South of Fourth Line at the intersection of the Fourth Line and Peoples Road.',
        cemeteryKey: 'NG',
        cemeterySvg: 'newGreenwood-overview.svg',
        cemeteryLatitude: '46.56489455',
        cemeteryLongitude: '-84.34944391',
        cemeteryAddress1: '27 Fourth Line East',
        cemeteryAddress2: '',
        cemeteryCity: 'Sault Ste. Marie',
        cemeteryPostalCode: 'P6A 5K8',
        cemeteryProvince: 'ON',
        cemeteryPhoneNumber: '',
        parentCemeteryId: ''
    },
    NW: {
        cemeteryName: 'Niche Wall',
        cemeteryDescription: 'At New Greenwood Cemetery',
        cemeteryKey: 'NW',
        cemeterySvg: '',
        cemeteryLatitude: '',
        cemeteryLongitude: '',
        cemeteryAddress1: 'Fourth Line East',
        cemeteryAddress2: '',
        cemeteryCity: 'Sault Ste. Marie',
        cemeteryPostalCode: '',
        cemeteryProvince: 'ON',
        cemeteryPhoneNumber: '',
        parentCemeteryId: ''
    },
    OG: {
        cemeteryName: 'Old Greenwood',
        cemeteryDescription: 'South of Fourth Line at the intersection of the Fourth Line and Peoples Road.',
        cemeteryKey: 'OG',
        cemeterySvg: 'oldGreenwood-overview.svg',
        cemeteryLatitude: '46.56468801',
        cemeteryLongitude: '-84.35317755',
        cemeteryAddress1: 'Fourth Line West',
        cemeteryAddress2: '',
        cemeteryCity: 'Sault Ste. Marie',
        cemeteryPostalCode: '',
        cemeteryProvince: 'ON',
        cemeteryPhoneNumber: '',
        parentCemeteryId: ''
    },
    PG: {
        cemeteryName: 'Pine Grove',
        cemeteryDescription: 'Landslide Road across from Kinsmen Park entrance.',
        cemeteryKey: 'PG',
        cemeterySvg: 'pineGrove-overview.svg',
        cemeteryLatitude: '46.58951884',
        cemeteryLongitude: '-84.28028584',
        cemeteryAddress1: 'Landslide Road',
        cemeteryAddress2: '',
        cemeteryCity: 'Sault Ste. Marie',
        cemeteryPostalCode: '',
        cemeteryProvince: 'ON',
        cemeteryPhoneNumber: '',
        parentCemeteryId: ''
    },
    UG: {
        cemeteryName: 'New Greenwood - Urn Garden',
        cemeteryDescription: 'At New Greenwood Cemetery',
        cemeteryKey: 'UG',
        cemeterySvg: 'newGreenwood-urnGarden.svg',
        cemeteryLatitude: '46.56603051',
        cemeteryLongitude: '-84.35148239',
        cemeteryAddress1: 'Fourth Line East',
        cemeteryAddress2: '',
        cemeteryCity: 'Sault Ste. Marie',
        cemeteryPostalCode: '',
        cemeteryProvince: 'ON',
        cemeteryPhoneNumber: '',
        parentCemeteryId: ''
    },
    WK: {
        cemeteryName: 'West Korah',
        cemeteryDescription: "Northeast corner of the intersection of Avery Road and Allen's Side Road.",
        cemeteryKey: 'WK',
        cemeterySvg: 'westKorah-overview.svg',
        cemeteryLatitude: '46.55824799',
        cemeteryLongitude: '-84.40500855',
        cemeteryAddress1: '',
        cemeteryAddress2: '',
        cemeteryCity: 'Sault Ste. Marie',
        cemeteryPostalCode: '',
        cemeteryProvince: 'ON',
        cemeteryPhoneNumber: '',
        parentCemeteryId: ''
    },
    WS: {
        cemeteryName: 'West Section',
        cemeteryDescription: 'At Old Greenwood Cemetery',
        cemeteryKey: 'WS',
        cemeterySvg: '',
        cemeteryLatitude: '46.56609690',
        cemeteryLongitude: '-84.35562372',
        cemeteryAddress1: 'Fourth Line West',
        cemeteryAddress2: '',
        cemeteryCity: 'Sault Ste. Marie',
        cemeteryPostalCode: '',
        cemeteryProvince: 'ON',
        cemeteryPhoneNumber: '',
        parentCemeteryId: ''
    }
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
        let addForm = cemeteryKeyToCemetery[cemeteryKey];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        addForm ??= {
            cemeteryName: cemeteryKey,
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
            cemeteryPhoneNumber: '',
            parentCemeteryId: ''
        };
        const cemeteryId = await addCemetery(addForm, user);
        cemeteryCache.set(cemeteryKey, cemeteryId);
    }
    return cemeteryCache.get(cemeteryKey);
}
