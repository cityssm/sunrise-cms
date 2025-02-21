import getMaps from '../../database/getMaps.js';
import { getLotStatuses, getLotTypes } from '../../helpers/functions.cache.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    const lot = {
        lotId: -1,
        lotOccupancies: []
    };
    const maps = await getMaps();
    if (request.query.mapId !== undefined) {
        const mapId = Number.parseInt(request.query.mapId, 10);
        const map = maps.find((possibleMap) => {
            return mapId === possibleMap.mapId;
        });
        if (map !== undefined) {
            lot.mapId = map.mapId;
            lot.mapName = map.mapName;
        }
    }
    const lotTypes = await getLotTypes();
    const lotStatuses = await getLotStatuses();
    response.render('lot-edit', {
        headTitle: `Create a New ${getConfigProperty('aliases.lot')}`,
        lot,
        isCreate: true,
        maps,
        lotTypes,
        lotStatuses
    });
}
