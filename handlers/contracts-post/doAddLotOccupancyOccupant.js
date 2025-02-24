import addLotOccupancyOccupant from '../../database/addLotOccupancyOccupant.js';
import getLotOccupancyOccupants from '../../database/getLotOccupancyOccupants.js';
export default async function handler(request, response) {
    await addLotOccupancyOccupant(request.body, request.session.user);
    const lotOccupancyOccupants = await getLotOccupancyOccupants(request.body.burialSiteContractId);
    response.json({
        success: true,
        lotOccupancyOccupants
    });
}
