// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable unicorn/no-null */
import { defaultDirectionsOfArrival } from '../../database/getBurialSiteDirectionsOfArrival.js';
import getCemeteries from '../../database/getCemeteries.js';
import { getCachedSettingValue } from '../../helpers/cache/settings.cache.js';
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
        childCemeteries: [],
        directionsOfArrival: defaultDirectionsOfArrival
    };
    const cemeteries = getCemeteries();
    const cemeterySVGs = await getCemeterySVGs();
    response.render('cemeteries/edit', {
        headTitle: 'Create a Cemetery',
        cemetery,
        cemeterySVGs,
        isCreate: true,
        cemeteries
    });
}
