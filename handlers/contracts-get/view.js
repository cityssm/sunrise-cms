import getContract from '../../database/getContract.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getContractTypePrintsById } from '../../helpers/cache.helpers.js';
export default async function handler(request, response) {
    const contract = await getContract(request.params.contractId);
    if (contract === undefined) {
        response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/contracts/?error=contractIdNotFound`);
        return;
    }
    const contractTypePrints = getContractTypePrintsById(contract.contractTypeId);
    response.render('contract-view', {
        headTitle: `Contract #${contract.contractId.toString()}`,
        contract,
        contractTypePrints
    });
}
