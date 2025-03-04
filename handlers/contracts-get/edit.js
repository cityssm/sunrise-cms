import getContract from '../../database/getContract.js';
import getFuneralHomes from '../../database/getFuneralHomes.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getContractTypePrintsById, getContractTypes, getWorkOrderTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const contract = await getContract(request.params.contractId);
    if (contract === undefined) {
        response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/contracts/?error=contractIdNotFound`);
        return;
    }
    const contractTypePrints = await getContractTypePrintsById(contract.contractTypeId);
    const contractTypes = await getContractTypes();
    const funeralHomes = await getFuneralHomes();
    const workOrderTypes = await getWorkOrderTypes();
    response.render('contract-edit', {
        headTitle: 'Contract Update',
        contract,
        contractTypePrints,
        contractTypes,
        funeralHomes,
        workOrderTypes,
        isCreate: false
    });
}
