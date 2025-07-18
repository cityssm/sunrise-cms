import { dateToInteger, dateToString } from '@cityssm/utils-datetime';
import getBurialSite from '../../database/getBurialSite.js';
import getBurialSiteDirectionsOfArrival, { defaultDirectionsOfArrival } from '../../database/getBurialSiteDirectionsOfArrival.js';
import getCemeteries from '../../database/getCemeteries.js';
import getFuneralHomes from '../../database/getFuneralHomes.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getBurialSiteStatuses, getBurialSiteTypes, getCommittalTypes, getContractTypes, getIntermentContainerTypes } from '../../helpers/cache.helpers.js';
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
            contract.cemeteryId = burialSite.cemeteryId ?? undefined;
            contract.cemeteryName = burialSite.cemeteryName;
        }
    }
    /*
     * Contract Drop Lists
     */
    const contractTypes = getContractTypes();
    const funeralHomes = getFuneralHomes();
    const committalTypes = getCommittalTypes();
    const intermentContainerTypes = getIntermentContainerTypes();
    /*
     * Burial Site Drop Lists
     */
    const burialSiteStatuses = getBurialSiteStatuses();
    const burialSiteTypes = getBurialSiteTypes();
    const cemeteries = getCemeteries();
    const burialSiteDirectionsOfArrival = contract.burialSiteId === undefined
        ? defaultDirectionsOfArrival
        : getBurialSiteDirectionsOfArrival(contract.burialSiteId);
    response.render('contract-edit', {
        headTitle: 'Create a New Contract',
        contract,
        committalTypes,
        contractTypes,
        funeralHomes,
        intermentContainerTypes,
        burialSiteStatuses,
        burialSiteTypes,
        cemeteries,
        burialSiteDirectionsOfArrival,
        isCreate: true
    });
}
