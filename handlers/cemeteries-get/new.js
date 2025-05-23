import getCemeteries from '../../database/getCemeteries.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getCemeterySVGs } from '../../helpers/images.helpers.js';
import { defaultDirectionsOfArrival } from '../../database/getBurialSiteDirectionsOfArrival.js';
export default async function handler(_request, response) {
    const cemetery = {
        cemeteryCity: getConfigProperty('settings.cityDefault'),
        cemeteryProvince: getConfigProperty('settings.provinceDefault'),
        cemeteryAddress1: '',
        cemeteryAddress2: '',
        cemeteryDescription: '',
        cemeteryKey: '',
        cemeteryName: '',
        cemeteryPhoneNumber: '',
        cemeteryPostalCode: '',
        childCemeteries: [],
        directionsOfArrival: defaultDirectionsOfArrival
    };
    const cemeteries = getCemeteries();
    const cemeterySVGs = await getCemeterySVGs();
    response.render('cemetery-edit', {
        headTitle: 'Create a Cemetery',
        cemetery,
        cemeterySVGs,
        isCreate: true,
        cemeteries
    });
}
