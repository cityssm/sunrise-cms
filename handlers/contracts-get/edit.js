import getLotOccupancy from '../../database/getLotOccupancy.js';
import getMaps from '../../database/getMaps.js';
import { getLotOccupantTypes, getLotStatuses, getLotTypes, getOccupancyTypePrintsById, getOccupancyTypes, getWorkOrderTypes } from '../../helpers/functions.cache.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    const lotOccupancy = await getLotOccupancy(request.params.lotOccupancyId);
    if (lotOccupancy === undefined) {
        response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/lotOccupancies/?error=lotOccupancyIdNotFound`);
        return;
    }
    const occupancyTypePrints = await getOccupancyTypePrintsById(lotOccupancy.occupancyTypeId);
    const occupancyTypes = await getOccupancyTypes();
    const lotOccupantTypes = await getLotOccupantTypes();
    const lotTypes = await getLotTypes();
    const lotStatuses = await getLotStatuses();
    const maps = await getMaps();
    const workOrderTypes = await getWorkOrderTypes();
    response.render('lotOccupancy-edit', {
        headTitle: `${getConfigProperty('aliases.occupancy')} Update`,
        lotOccupancy,
        occupancyTypePrints,
        occupancyTypes,
        lotOccupantTypes,
        lotTypes,
        lotStatuses,
        maps,
        workOrderTypes,
        isCreate: false
    });
}
