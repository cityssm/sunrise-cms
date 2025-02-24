import getNextCemeteryId from '../../database/getNextCemeteryId.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    const cemeteryId = Number.parseInt(request.params.cemeteryId, 10);
    const nextCemeteryId = await getNextCemeteryId(cemeteryId);
    if (nextCemeteryId === undefined) {
        response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/cemeteries/?error=noNextCemeteryIdFound`);
        return;
    }
    response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/cemeteries/${nextCemeteryId.toString()}`);
}
