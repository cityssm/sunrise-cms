import getContract from '../../database/getContract.js';
import { getCachedContractTypePrintsById } from '../../helpers/cache/contractTypes.cache.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { i18next } from '../../helpers/i18n.helpers.js';
export default async function handler(request, response) {
    const contract = await getContract(request.params.contractId);
    if (contract === undefined) {
        response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/contracts/?error=contractIdNotFound`);
        return;
    }
    const contractTypePrints = getCachedContractTypePrintsById(contract.contractTypeId);
    response.render('contracts/view', {
        headTitle: i18next.t('contracts:contractTitle', {
            id: contract.contractId.toString(),
            lng: response.locals.lng
        }),
        contract,
        contractTypePrints
    });
}
