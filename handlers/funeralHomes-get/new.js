import { getCachedSettingValue } from '../../helpers/cache/settings.cache.js';
import { i18next } from '../../helpers/i18n.helpers.js';
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
        headTitle: i18next.t('contracts:createNewFuneralHome', { lng: response.locals.lng }),
        funeralHome,
        isCreate: true
    });
}
