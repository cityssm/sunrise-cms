import getContract from '../../database/getContract.js';
import { getCachedContractTypePrintsById } from '../../helpers/cache/contractTypes.cache.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    const contract = await getContract(request.params.contractId);
    if (contract === undefined) {
        response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/contracts/?error=contractIdNotFound`);
        return;
    }
    const contractTypePrints = getCachedContractTypePrintsById(contract.contractTypeId);
    response.render('contracts/view', {
        headTitle: `Contract #${contract.contractId.toString()}`,
        contract,
        contractTypePrints
    });
}
