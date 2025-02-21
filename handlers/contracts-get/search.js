import getMaps from '../../database/getMaps.js';
import { getLotTypes, getOccupancyTypes } from '../../helpers/functions.cache.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    const maps = await getMaps();
    const lotTypes = await getLotTypes();
    const occupancyTypes = await getOccupancyTypes();
    response.render('lotOccupancy-search', {
        headTitle: `${getConfigProperty('aliases.occupancy')} Search`,
        maps,
        lotTypes,
        occupancyTypes,
        mapId: request.query.mapId
    });
}
