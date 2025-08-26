import { dateToInteger, dateToString } from '@cityssm/utils-datetime';
import getBurialSite from '../../database/getBurialSite.js';
import getBurialSiteDirectionsOfArrival, { defaultDirectionsOfArrival } from '../../database/getBurialSiteDirectionsOfArrival.js';
import getCemeteries from '../../database/getCemeteries.js';
import getFuneralHomes from '../../database/getFuneralHomes.js';
import { getCachedBurialSiteStatuses } from '../../helpers/cache/burialSiteStatuses.cache.js';
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js';
import { getCachedCommittalTypes } from '../../helpers/cache/committalTypes.cache.js';
import { getCachedContractTypes } from '../../helpers/cache/contractTypes.cache.js';
import { getCachedIntermentContainerTypes } from '../../helpers/cache/intermentContainerTypes.cache.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
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
    const contractTypes = getCachedContractTypes();
    const funeralHomes = getFuneralHomes();
    const committalTypes = getCachedCommittalTypes();
    const intermentContainerTypes = getCachedIntermentContainerTypes();
    /*
     * Burial Site Drop Lists
     */
    const burialSiteStatuses = getCachedBurialSiteStatuses();
    const burialSiteTypes = getCachedBurialSiteTypes();
    const cemeteries = getCemeteries();
    const burialSiteDirectionsOfArrival = contract.burialSiteId === undefined || contract.burialSiteId === null
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
        funeralDirectorNames: [],
        isCreate: true
    });
}
