import getBurialSiteContract from '../../database/getBurialSiteContract.js';
import getCemeteries from '../../database/getCemeteries.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getBurialSiteStatuses, getBurialSiteTypes, getContractTypePrintsById, getContractTypes, getWorkOrderTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const burialSiteContract = await getBurialSiteContract(request.params.burialSiteContractId);
    if (burialSiteContract === undefined) {
        response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/contracts/?error=burialSiteContractIdNotFound`);
        return;
    }
    const contractTypePrints = await getContractTypePrintsById(burialSiteContract.contractTypeId);
    const contractTypes = await getContractTypes();
    const burialSiteTypes = await getBurialSiteTypes();
    const burialSiteStatuses = await getBurialSiteStatuses();
    const cemeteries = await getCemeteries();
    const workOrderTypes = await getWorkOrderTypes();
    response.render('burialSiteContract-edit', {
        headTitle: 'Contract Update',
        burialSiteContract,
        contractTypePrints,
        contractTypes,
        burialSiteTypes,
        burialSiteStatuses,
        cemeteries,
        workOrderTypes,
        isCreate: false
    });
}
