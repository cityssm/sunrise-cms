import getMaps from '../../database/getMaps.js';
import { getLotStatuses, getLotTypes } from '../../helpers/functions.cache.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    const maps = await getMaps();
    const lotTypes = await getLotTypes();
    const lotStatuses = await getLotStatuses();
    response.render('lot-search', {
        headTitle: `${getConfigProperty('aliases.lot')} Search`,
        maps,
        lotTypes,
        lotStatuses,
        mapId: request.query.mapId,
        lotTypeId: request.query.lotTypeId,
        lotStatusId: request.query.lotStatusId
    });
}
