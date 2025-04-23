import getPreviousContractId from '../../database/getPreviousContractId.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    const contractId = Number.parseInt(request.params.contractId, 10);
    const previousContractId = await getPreviousContractId(contractId);
    if (previousContractId === undefined) {
        response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/contracts/?error=noPreviousContractIdFound`);
        return;
    }
    response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/contracts/${previousContractId.toString()}`);
}
