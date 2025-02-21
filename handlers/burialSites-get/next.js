import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getNextLotId } from '../../helpers/functions.lots.js';
export default async function handler(request, response) {
    const lotId = Number.parseInt(request.params.lotId, 10);
    const nextLotId = await getNextLotId(lotId);
    if (nextLotId === undefined) {
        response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/lots/?error=noNextLotIdFound`);
        return;
    }
    response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/lots/${nextLotId.toString()}`);
}
