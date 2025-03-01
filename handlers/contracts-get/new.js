import { dateToInteger, dateToString } from '@cityssm/utils-datetime';
import getBurialSite from '../../database/getBurialSite.js';
import getCemeteries from '../../database/getCemeteries.js';
import { getBurialSiteStatuses, getBurialSiteTypes, getContractTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const startDate = new Date();
    const contract = {
        contractStartDate: dateToInteger(startDate),
        contractStartDateString: dateToString(startDate)
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
    const burialSiteTypes = await getBurialSiteTypes();
    const burialSiteStatuses = await getBurialSiteStatuses();
    const cemeteries = await getCemeteries();
    response.render('contract-edit', {
        headTitle: 'Create a New Contract',
        contract,
        contractTypes,
        burialSiteTypes,
        burialSiteStatuses,
        cemeteries,
        isCreate: true
    });
}
