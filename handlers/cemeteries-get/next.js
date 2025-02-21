import getNextMapId from '../../database/getNextMapId.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    const mapId = Number.parseInt(request.params.mapId, 10);
    const nextMapId = await getNextMapId(mapId);
    if (nextMapId === undefined) {
        response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/maps/?error=noNextMapIdFound`);
        return;
    }
    response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/maps/${nextMapId.toString()}`);
}
