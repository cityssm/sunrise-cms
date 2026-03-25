/* eslint-disable unicorn/no-null */
import { defaultDirectionsOfArrival } from '../../database/getBurialSiteDirectionsOfArrival.js';
import { getCachedCemeteries } from '../../helpers/cache/cemeteries.cache.js';
import { getCachedSettingValue } from '../../helpers/cache/settings.cache.js';
import { i18next } from '../../helpers/i18n.helpers.js';
import { getCemeterySVGs } from '../../helpers/images.helpers.js';
export default async function handler(_request, response) {
    const cemetery = {
        cemeteryCity: getCachedSettingValue('defaults.city'),
        cemeteryProvince: getCachedSettingValue('defaults.province'),
        cemeteryAddress1: '',
        cemeteryAddress2: '',
        cemeteryDescription: '',
        cemeteryKey: '',
        cemeteryName: '',
        cemeteryPhoneNumber: '',
        cemeteryPostalCode: '',
        cemeteryLatitude: null,
        cemeteryLongitude: null,
        cemeterySvg: '',
        findagraveCemeteryId: null,
        findagraveCemeteryUrl: null,
        childCemeteries: [],
        directionsOfArrival: defaultDirectionsOfArrival
    };
    const cemeteries = getCachedCemeteries();
    const cemeterySVGs = await getCemeterySVGs();
    response.render('cemeteries/edit', {
        headTitle: i18next.t('cemeteries.createNewCemetery', {
            lng: response.locals.lng
        }),
        cemetery,
        cemeterySVGs,
        isCreate: true,
        cemeteries
    });
}
