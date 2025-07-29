import getBurialSiteDirectionsOfArrival, { defaultDirectionsOfArrival } from '../../database/getBurialSiteDirectionsOfArrival.js';
import getCemeteries from '../../database/getCemeteries.js';
import getContract from '../../database/getContract.js';
import getFuneralHomes from '../../database/getFuneralHomes.js';
import { getCachedBurialSiteStatuses } from '../../helpers/cache/burialSiteStatuses.cache.js';
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js';
import { getCachedCommittalTypes } from '../../helpers/cache/committalTypes.cache.js';
import { getCachedContractTypePrintsById, getCachedContractTypes } from '../../helpers/cache/contractTypes.cache.js';
import { getCachedIntermentContainerTypes } from '../../helpers/cache/intermentContainerTypes.cache.js';
import { getCachedWorkOrderTypes } from '../../helpers/cache/workOrderTypes.cache.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { userHasConsignoCloudAccess } from '../../integrations/consignoCloud/helpers.js';
export default async function handler(request, response) {
    const contract = await getContract(request.params.contractId);
    if (contract === undefined) {
        response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/contracts/?error=contractIdNotFound`);
        return;
    }
    const contractTypePrints = getCachedContractTypePrintsById(contract.contractTypeId);
    const consignoCloudAccess = userHasConsignoCloudAccess(request.session.user);
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
    const burialSiteDirectionsOfArrival = contract.burialSiteId === undefined
        ? defaultDirectionsOfArrival
        : getBurialSiteDirectionsOfArrival(contract.burialSiteId);
    /*
     * Work Order Drop Lists
     */
    const workOrderTypes = getCachedWorkOrderTypes();
    response.render('contract-edit', {
        headTitle: 'Contract Update',
        contract,
        contractTypePrints,
        userHasConsignoCloudAccess: consignoCloudAccess,
        committalTypes,
        contractTypes,
        funeralHomes,
        intermentContainerTypes,
        burialSiteStatuses,
        burialSiteTypes,
        cemeteries,
        burialSiteDirectionsOfArrival,
        workOrderTypes,
        isCreate: false
    });
}
