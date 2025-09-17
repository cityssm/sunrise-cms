import { getCachedSettingValue } from '../../helpers/cache/settings.cache.js';
export default function handler(_request, response) {
    const funeralHome = {
        funeralHomeName: '',
        funeralHomeAddress1: '',
        funeralHomeAddress2: '',
        funeralHomeCity: getCachedSettingValue('defaults.city'),
        funeralHomePostalCode: '',
        funeralHomeProvince: getCachedSettingValue('defaults.province'),
        funeralHomePhoneNumber: ''
    };
    response.render('funeralHomes/edit', {
        headTitle: 'Create a Funeral Home',
        funeralHome,
        isCreate: true
    });
}
