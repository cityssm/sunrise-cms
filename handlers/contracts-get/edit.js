import getCemeteries from '../../database/getCemeteries.js';
import getContract from '../../database/getContract.js';
import getFuneralHomes from '../../database/getFuneralHomes.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getBurialSiteStatuses, getBurialSiteTypes, getCommittalTypes, getContractTypePrintsById, getContractTypes, getIntermentContainerTypes, getWorkOrderTypes } from '../../helpers/functions.cache.js';
import getBurialSiteDirectionsOfArrival, { defaultDirectionsOfArrival } from '../../database/getBurialSiteDirectionsOfArrival.js';
export default async function handler(request, response) {
    const contract = await getContract(request.params.contractId);
    if (contract === undefined) {
        response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/contracts/?error=contractIdNotFound`);
        return;
    }
    const contractTypePrints = getContractTypePrintsById(contract.contractTypeId);
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
    /*
     * Work Order Drop Lists
     */
    const workOrderTypes = getWorkOrderTypes();
    response.render('contract-edit', {
        headTitle: 'Contract Update',
        contract,
        committalTypes,
        contractTypePrints,
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
