import getNextContractId from '../../database/getNextContractId.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default function handler(request, response) {
    const contractId = Math.trunc(Number(request.params.contractId));
    const nextContractId = getNextContractId(contractId);
    if (nextContractId === undefined) {
        response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/contracts/?error=noNextContractIdFound`);
        return;
    }
    response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/contracts/${nextContractId.toString()}`);
}
