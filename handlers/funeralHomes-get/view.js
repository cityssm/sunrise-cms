import getContracts from '../../database/getContracts.js';
import getFuneralHome from '../../database/getFuneralHome.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    const funeralHome = getFuneralHome(request.params.funeralHomeId, request.session.user?.userProperties?.canUpdate);
    if (funeralHome === undefined) {
        response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/funeralHomes/?error=funeralHomeIdNotFound`);
        return;
    }
    const contracts = await getContracts({
        funeralHomeId: funeralHome.funeralHomeId,
        funeralTime: 'upcoming'
    }, {
        limit: -1,
        offset: 0,
        orderBy: 'c.funeralDate, c.funeralTime, c.contractId',
        includeFees: false,
        includeInterments: true,
        includeTransactions: false
    });
    response.render('funeralHome-view', {
        headTitle: funeralHome.funeralHomeName,
        funeralHome,
        contracts: contracts.contracts
    });
}
