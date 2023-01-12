import * as configFunctions from '../../helpers/functions.config.js';
import { getMaps } from '../../helpers/lotOccupancyDB/getMaps.js';
import { getLotTypes, getOccupancyTypes } from '../../helpers/functions.cache.js';
export const handler = (request, response) => {
    const maps = getMaps();
    const lotTypes = getLotTypes();
    const occupancyTypes = getOccupancyTypes();
    response.render('lotOccupancy-search', {
        headTitle: configFunctions.getProperty('aliases.occupancy') + ' Search',
        maps,
        lotTypes,
        occupancyTypes,
        mapId: request.query.mapId
    });
};
export default handler;
