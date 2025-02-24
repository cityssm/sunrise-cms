import getLotOccupancyOccupants from '../../database/getLotOccupancyOccupants.js';
import updateLotOccupancyOccupant from '../../database/updateLotOccupancyOccupant.js';
export default async function handler(request, response) {
    const success = await updateLotOccupancyOccupant(request.body, request.session.user);
    const lotOccupancyOccupants = await getLotOccupancyOccupants(request.body.burialSiteContractId);
    response.json({
        success,
        lotOccupancyOccupants
    });
}
