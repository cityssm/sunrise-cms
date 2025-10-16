// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable @cspell/spellchecker */
import addFuneralHome from '../../database/addFuneralHome.js';
const funeralHomes = [
    {
        funeralHomeKey: 'AR',
        funeralHomeName: 'Arthur Funeral Home',
        funeralHomeAddress1: '492 Wellington Street East',
        funeralHomeAddress2: '',
        funeralHomeCity: 'Sault Ste. Marie',
        funeralHomePostalCode: 'P6A 2L9',
        funeralHomeProvince: 'ON',
        funeralHomePhoneNumber: '705-759-2522'
    },
    {
        funeralHomeKey: 'BG',
        funeralHomeName: 'Beggs Funeral Home',
        funeralHomeAddress1: '175 Main Street',
        funeralHomeAddress2: 'P.O. Box 280',
        funeralHomeCity: 'Thessalon',
        funeralHomePostalCode: 'P0R 1L0',
        funeralHomeProvince: 'ON',
        funeralHomePhoneNumber: '705-842-2520'
    },
    {
        funeralHomeKey: 'BK',
        funeralHomeName: 'Barton and Kiteley',
        funeralHomeAddress1: '',
        funeralHomeAddress2: '',
        funeralHomeCity: 'Sault Ste. Marie',
        funeralHomePostalCode: '',
        funeralHomeProvince: 'ON',
        funeralHomePhoneNumber: ''
    },
    {
        funeralHomeKey: 'DA',
        funeralHomeName: 'Damignani Burial, Cremation and Transfer Service',
        funeralHomeAddress1: '215 St. James Street',
        funeralHomeAddress2: '',
        funeralHomeCity: 'Sault Ste. Marie',
        funeralHomePostalCode: 'P6A 1P7',
        funeralHomeProvince: 'ON',
        funeralHomePhoneNumber: '705-759-8456'
    },
    {
        funeralHomeKey: 'GL',
        funeralHomeName: 'Gilmartin P.M. Funeral Home',
        funeralHomeAddress1: '140 Churchill Avenue',
        funeralHomeAddress2: '',
        funeralHomeCity: 'Wawa',
        funeralHomePostalCode: 'P0S 1K0',
        funeralHomeProvince: 'ON',
        funeralHomePhoneNumber: '705-856-7340'
    },
    {
        funeralHomeKey: 'HO',
        funeralHomeName: 'Hovie Funeral Home',
        funeralHomeAddress1: '',
        funeralHomeAddress2: '',
        funeralHomeCity: 'Sault Ste. Marie',
        funeralHomePostalCode: '',
        funeralHomeProvince: 'MI',
        funeralHomePhoneNumber: ''
    },
    {
        funeralHomeKey: 'LY',
        funeralHomeName: 'Lynett Funeral Home',
        funeralHomeAddress1: '',
        funeralHomeAddress2: '',
        funeralHomeCity: 'Wawa',
        funeralHomePostalCode: '',
        funeralHomeProvince: 'ON',
        funeralHomePhoneNumber: ''
    },
    {
        funeralHomeKey: 'NO',
        funeralHomeName: 'Northwood Funeral Home',
        funeralHomeAddress1: '942 Great Northern Road',
        funeralHomeAddress2: '',
        funeralHomeCity: 'Sault Ste. Marie',
        funeralHomePostalCode: 'P6B 0B6',
        funeralHomeProvince: 'ON',
        funeralHomePhoneNumber: '705-945-7758'
    },
    {
        funeralHomeKey: 'OS',
        funeralHomeName: "O'Sullivan Funeral Home",
        funeralHomeAddress1: '215 St. James Street',
        funeralHomeAddress2: '',
        funeralHomeCity: 'Sault Ste. Marie',
        funeralHomePostalCode: 'P6A 1P7',
        funeralHomeProvince: 'ON',
        funeralHomePhoneNumber: '705-759-8456'
    },
    {
        funeralHomeKey: 'ME',
        funeralHomeName: 'Menard Funeral Home',
        funeralHomeAddress1: '72 Lakeside Avenue',
        funeralHomeAddress2: '',
        funeralHomeCity: 'Blind River',
        funeralHomePostalCode: 'P0R 1B0',
        funeralHomeProvince: 'ON',
        funeralHomePhoneNumber: '705-356-7151'
    }
];
const funeralHomeKeyToId = new Map();
export function getFuneralHomeIdByKey(funeralHomeKey, user, database) {
    if (funeralHomeKeyToId.has(funeralHomeKey)) {
        return funeralHomeKeyToId.get(funeralHomeKey);
    }
    const funeralHomeId = addFuneralHome({
        funeralHomeKey,
        funeralHomeName: funeralHomeKey,
        funeralHomeAddress1: '',
        funeralHomeAddress2: '',
        funeralHomeCity: '',
        funeralHomePostalCode: '',
        funeralHomeProvince: '',
        funeralHomePhoneNumber: ''
    }, user, database);
    funeralHomeKeyToId.set(funeralHomeKey, funeralHomeId);
    return funeralHomeId;
}
export function initializeFuneralHomes(user) {
    for (const funeralHome of funeralHomes) {
        const funeralHomeId = addFuneralHome({
            funeralHomeKey: funeralHome.funeralHomeKey ?? '',
            funeralHomeName: funeralHome.funeralHomeName,
            funeralHomeAddress1: funeralHome.funeralHomeAddress1,
            funeralHomeAddress2: funeralHome.funeralHomeAddress2,
            funeralHomeCity: funeralHome.funeralHomeCity,
            funeralHomePostalCode: funeralHome.funeralHomePostalCode,
            funeralHomeProvince: funeralHome.funeralHomeProvince,
            funeralHomePhoneNumber: funeralHome.funeralHomePhoneNumber
        }, user);
        funeralHomeKeyToId.set(funeralHome.funeralHomeKey ?? '', funeralHomeId);
    }
}
