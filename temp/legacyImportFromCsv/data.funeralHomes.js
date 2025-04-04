import addFuneralHome from "../../database/addFuneralHome.js";
const funeralHomes = [
    {
        funeralHomeKey: 'AR',
        funeralHomeName: 'Arthur Funeral Home',
        funeralHomeAddress1: '492 Wellington Street East',
        funeralHomeAddress2: '',
        funeralHomeCity: 'Sault Ste. Marie',
        funeralHomeProvince: 'ON',
        funeralHomePostalCode: 'P6A 2L9',
        funeralHomePhoneNumber: '705-759-2522'
    },
    {
        funeralHomeKey: 'BG',
        funeralHomeName: 'Beggs Funeral Home',
        funeralHomeAddress1: '175 Main Street',
        funeralHomeAddress2: 'P.O. Box 280',
        funeralHomeCity: 'Thessalon',
        funeralHomeProvince: 'ON',
        funeralHomePostalCode: 'P0R 1L0',
        funeralHomePhoneNumber: '705-842-2520'
    },
    {
        funeralHomeKey: 'BK',
        funeralHomeName: 'Barton and Kiteley',
        funeralHomeAddress1: '',
        funeralHomeAddress2: '',
        funeralHomeCity: 'Sault Ste. Marie',
        funeralHomeProvince: 'ON',
        funeralHomePostalCode: '',
        funeralHomePhoneNumber: ''
    },
    {
        funeralHomeKey: 'DA',
        funeralHomeName: 'Damignani Burial, Cremation and Transfer Service',
        funeralHomeAddress1: '215 St. James Street',
        funeralHomeAddress2: '',
        funeralHomeCity: 'Sault Ste. Marie',
        funeralHomeProvince: 'ON',
        funeralHomePostalCode: 'P6A 1P7',
        funeralHomePhoneNumber: '705-759-8456'
    },
    {
        funeralHomeKey: 'GL',
        funeralHomeName: 'Gilmartin P.M. Funeral Home',
        funeralHomeAddress1: '140 Churchill Avenue',
        funeralHomeAddress2: '',
        funeralHomeCity: 'Wawa',
        funeralHomeProvince: 'ON',
        funeralHomePostalCode: 'P0S 1K0',
        funeralHomePhoneNumber: '705-856-7340'
    },
    {
        funeralHomeKey: 'NO',
        funeralHomeName: 'Northwood Funeral Home',
        funeralHomeAddress1: '942 Great Northern Road',
        funeralHomeAddress2: '',
        funeralHomeCity: 'Sault Ste. Marie',
        funeralHomeProvince: 'ON',
        funeralHomePostalCode: 'P6B 0B6',
        funeralHomePhoneNumber: '705-945-7758'
    },
    {
        funeralHomeKey: 'OS',
        funeralHomeName: "O'Sullivan Funeral Home",
        funeralHomeAddress1: '215 St. James Street',
        funeralHomeAddress2: '',
        funeralHomeCity: 'Sault Ste. Marie',
        funeralHomeProvince: 'ON',
        funeralHomePostalCode: 'P6A 1P7',
        funeralHomePhoneNumber: '705-759-8456'
    }
];
const funeralHomeKeyToId = new Map();
export async function initializeFuneralHomes(user) {
    for (const funeralHome of funeralHomes) {
        const funeralHomeId = await addFuneralHome({
            funeralHomeName: funeralHome.funeralHomeName ?? '',
            funeralHomeKey: funeralHome.funeralHomeKey ?? '',
            funeralHomeAddress1: funeralHome.funeralHomeAddress1 ?? '',
            funeralHomeAddress2: funeralHome.funeralHomeAddress2 ?? '',
            funeralHomeCity: funeralHome.funeralHomeCity ?? '',
            funeralHomeProvince: funeralHome.funeralHomeProvince ?? '',
            funeralHomePostalCode: funeralHome.funeralHomePostalCode ?? '',
            funeralHomePhoneNumber: funeralHome.funeralHomePhoneNumber ?? ''
        }, user);
        funeralHomeKeyToId.set(funeralHome.funeralHomeKey ?? '', funeralHomeId);
    }
}
export async function getFuneralHomeIdByKey(funeralHomeKey, user) {
    if (funeralHomeKeyToId.has(funeralHomeKey)) {
        return funeralHomeKeyToId.get(funeralHomeKey);
    }
    const funeralHomeId = await addFuneralHome({
        funeralHomeName: funeralHomeKey,
        funeralHomeKey,
        funeralHomeAddress1: '',
        funeralHomeAddress2: '',
        funeralHomeCity: '',
        funeralHomeProvince: '',
        funeralHomePostalCode: '',
        funeralHomePhoneNumber: ''
    }, user);
    funeralHomeKeyToId.set(funeralHomeKey, funeralHomeId);
    return funeralHomeId;
}
