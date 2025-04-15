import { dateToInteger, dateToString } from '@cityssm/utils-datetime';
import getBurialSite from '../../database/getBurialSite.js';
import getFuneralHomes from '../../database/getFuneralHomes.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getCommittalTypes, getContractTypes, getIntermentContainerTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const startDate = new Date();
    const contract = {
        isPreneed: false,
        contractStartDate: dateToInteger(startDate),
        contractStartDateString: dateToString(startDate),
        purchaserCity: getConfigProperty('settings.cityDefault'),
        purchaserProvince: getConfigProperty('settings.provinceDefault')
    };
    if (request.query.burialSiteId !== undefined) {
        const burialSite = await getBurialSite(request.query.burialSiteId);
        if (burialSite !== undefined) {
            contract.burialSiteId = burialSite.burialSiteId;
            contract.burialSiteName = burialSite.burialSiteName;
            contract.cemeteryId = burialSite.cemeteryId;
            contract.cemeteryName = burialSite.cemeteryName;
        }
    }
    const contractTypes = await getContractTypes();
    const funeralHomes = await getFuneralHomes();
    const committalTypes = await getCommittalTypes();
    const intermentContainerTypes = await getIntermentContainerTypes();
    response.render('contract-edit', {
        headTitle: 'Create a New Contract',
        contract,
        committalTypes,
        contractTypes,
        funeralHomes,
        intermentContainerTypes,
        isCreate: true
    });
}
