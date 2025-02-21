import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getPreviousLotId } from '../../helpers/functions.lots.js';
export default async function handler(request, response) {
    const lotId = Number.parseInt(request.params.lotId, 10);
    const previousLotId = await getPreviousLotId(lotId);
    if (previousLotId === undefined) {
        response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/lots/?error=noPreviousLotIdFound`);
        return;
    }
    response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/lots/${previousLotId.toString()}`);
}
