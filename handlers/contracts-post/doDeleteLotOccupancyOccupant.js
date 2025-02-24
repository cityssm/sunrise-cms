import deleteLotOccupancyOccupant from '../../database/deleteLotOccupancyOccupant.js';
import getLotOccupancyOccupants from '../../database/getLotOccupancyOccupants.js';
export default async function handler(request, response) {
    const success = await deleteLotOccupancyOccupant(request.body.burialSiteContractId, request.body.lotOccupantIndex, request.session.user);
    const lotOccupancyOccupants = await getLotOccupancyOccupants(request.body.burialSiteContractId);
    response.json({
        success,
        lotOccupancyOccupants
    });
}
