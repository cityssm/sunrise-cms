import getPreviousMapId from '../../database/getPreviousMapId.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    const mapId = Number.parseInt(request.params.mapId, 10);
    const previousMapId = await getPreviousMapId(mapId);
    if (previousMapId === undefined) {
        response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/maps/?error=noPreviousMapIdFound`);
        return;
    }
    response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/maps/${previousMapId.toString()}`);
}
