import { dateToInteger, dateToString } from '@cityssm/utils-datetime';
import getLot from '../../database/getLot.js';
import getMaps from '../../database/getMaps.js';
import { getLotOccupantTypes, getLotStatuses, getLotTypes, getOccupancyTypes } from '../../helpers/functions.cache.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    const startDate = new Date();
    const lotOccupancy = {
        occupancyStartDate: dateToInteger(startDate),
        occupancyStartDateString: dateToString(startDate)
    };
    if (request.query.lotId !== undefined) {
        const lot = await getLot(request.query.lotId);
        if (lot !== undefined) {
            lotOccupancy.lotId = lot.lotId;
            lotOccupancy.lotName = lot.lotName;
            lotOccupancy.mapId = lot.mapId;
            lotOccupancy.mapName = lot.mapName;
        }
    }
    const occupancyTypes = await getOccupancyTypes();
    const lotOccupantTypes = await getLotOccupantTypes();
    const lotTypes = await getLotTypes();
    const lotStatuses = await getLotStatuses();
    const maps = await getMaps();
    response.render('lotOccupancy-edit', {
        headTitle: `Create a New ${getConfigProperty('aliases.occupancy')} Record`,
        lotOccupancy,
        occupancyTypes,
        lotOccupantTypes,
        lotTypes,
        lotStatuses,
        maps,
        isCreate: true
    });
}
