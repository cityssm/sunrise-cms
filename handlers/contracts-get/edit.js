import getContract from '../../database/getContract.js';
import getFuneralHomes from '../../database/getFuneralHomes.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getCommittalTypes, getContractTypePrintsById, getContractTypes, getIntermentContainerTypes, getWorkOrderTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const contract = await getContract(request.params.contractId);
    if (contract === undefined) {
        response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/contracts/?error=contractIdNotFound`);
        return;
    }
    const contractTypePrints = getContractTypePrintsById(contract.contractTypeId);
    const contractTypes = getContractTypes();
    const funeralHomes = getFuneralHomes();
    const committalTypes = getCommittalTypes();
    const intermentContainerTypes = getIntermentContainerTypes();
    const workOrderTypes = getWorkOrderTypes();
    response.render('contract-edit', {
        headTitle: 'Contract Update',
        contract,
        committalTypes,
        contractTypePrints,
        contractTypes,
        funeralHomes,
        intermentContainerTypes,
        workOrderTypes,
        isCreate: false
    });
}
