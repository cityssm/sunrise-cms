// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-console */
import addCemetery from '../../database/addCemetery.js';
import { getCemeteryByKey } from '../../database/getCemetery.js';
export const cremationCemeteryKeys = new Set(['', '00', '`', 'N', 'R']);
const fourthLineCemeteryArrivalDirections = {
    directionOfArrival_E: 'E',
    directionOfArrivalDescription_E: 'Fourth Line East from Great Northern Road',
    directionOfArrival_S: 'S',
    directionOfArrivalDescription_S: 'Peoples Road from downtown',
    directionOfArrival_W: 'W',
    directionOfArrivalDescription_W: 'Fourth Line West'
};
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
        parentCemeteryId: '',
        ...fourthLineCemeteryArrivalDirections
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
        parentCemeteryId: '',
        ...fourthLineCemeteryArrivalDirections
    },
    HC: {
        cemeteryName: 'Holy Sepulchre - Columbarium',
        cemeteryDescription: 'At Holy Sepulchre Cemetery',
        cemeteryKey: 'HC',
        cemeterySvg: '',
        cemeteryLatitude: '46.56861214',
        cemeteryLongitude: '-84.34559226',
        cemeteryAddress1: 'Fourth Line East',
        cemeteryAddress2: '',
        cemeteryCity: 'Sault Ste. Marie',
        cemeteryPostalCode: '',
        cemeteryProvince: 'ON',
        cemeteryPhoneNumber: '',
        parentCemeteryId: '',
        ...fourthLineCemeteryArrivalDirections
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
        parentCemeteryId: '',
        ...fourthLineCemeteryArrivalDirections
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
        parentCemeteryId: '',
        ...fourthLineCemeteryArrivalDirections
    },
    MN: {
        cemeteryName: 'Holy Sepulchre - Mausoleum Niche',
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
        parentCemeteryId: '',
        ...fourthLineCemeteryArrivalDirections
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
        parentCemeteryId: '',
        ...fourthLineCemeteryArrivalDirections
    },
    NW: {
        cemeteryName: 'New Greenwood - Niche Wall',
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
        parentCemeteryId: '',
        ...fourthLineCemeteryArrivalDirections
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
        parentCemeteryId: '',
        ...fourthLineCemeteryArrivalDirections
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
        parentCemeteryId: '',
        directionOfArrival_S: 'S',
        directionOfArrivalDescription_S: 'Landslide Road from city',
        directionOfArrival_N: 'N',
        directionOfArrivalDescription_N: 'Landslide Road from Sixth Line East'
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
        parentCemeteryId: '',
        ...fourthLineCemeteryArrivalDirections
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
        parentCemeteryId: '',
        directionOfArrival_E: 'E',
        directionOfArrivalDescription_E: 'Allens Side Road',
        directionOfArrival_S: 'S',
        directionOfArrivalDescription_S: 'Avery Road'
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
        parentCemeteryId: '',
        ...fourthLineCemeteryArrivalDirections
    }
};
const cemeteryCache = new Map();
export function getCemeteryIdByKey(cemeteryKeyToSearch, user, database) {
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
    console.log(`Cemetery cache miss: ${cemeteryKey}`);
    const cemetery = getCemeteryByKey(cemeteryKey, database);
    console.log(`Cemetery found: ${cemeteryKey}`);
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
        const cemeteryId = addCemetery(addForm, user, database);
        cemeteryCache.set(cemeteryKey, cemeteryId);
    }
    else {
        cemeteryCache.set(cemeteryKey, cemetery.cemeteryId);
    }
    return cemeteryCache.get(cemeteryKey);
}
