import updateLotOccupancy from '../../database/updateLotOccupancy.js';
export default async function handler(request, response) {
    const success = await updateLotOccupancy(request.body, request.session.user);
    response.json({
        success,
        lotOccupancyId: request.body.lotOccupancyId
    });
}
