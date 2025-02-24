import getLotStatusSummary from '../../database/getLotStatusSummary.js';
import getLotTypeSummary from '../../database/getLotTypeSummary.js';
import getMap from '../../database/getMap.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    const map = await getMap(request.params.cemeteryId);
    if (map === undefined) {
        response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/maps/?error=cemeteryIdNotFound`);
        return;
    }
    const lotTypeSummary = await getLotTypeSummary({
        cemeteryId: map.cemeteryId
    });
    const lotStatusSummary = await getLotStatusSummary({
        cemeteryId: map.cemeteryId
    });
    response.render('map-view', {
        headTitle: map.cemeteryName,
        map,
        lotTypeSummary,
        lotStatusSummary
    });
}
