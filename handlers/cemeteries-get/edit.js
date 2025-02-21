import getLotStatusSummary from '../../database/getLotStatusSummary.js';
import getLotTypeSummary from '../../database/getLotTypeSummary.js';
import getMap from '../../database/getMap.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getMapSVGs } from '../../helpers/functions.map.js';
export default async function handler(request, response) {
    const map = await getMap(request.params.mapId);
    if (map === undefined) {
        response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/maps/?error=mapIdNotFound`);
        return;
    }
    const mapSVGs = await getMapSVGs();
    const lotTypeSummary = await getLotTypeSummary({
        mapId: map.mapId
    });
    const lotStatusSummary = await getLotStatusSummary({
        mapId: map.mapId
    });
    response.render('map-edit', {
        headTitle: map.mapName,
        isCreate: false,
        map,
        mapSVGs,
        lotTypeSummary,
        lotStatusSummary
    });
}
