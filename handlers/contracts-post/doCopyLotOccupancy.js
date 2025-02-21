import copyLotOccupancy from '../../database/copyLotOccupancy.js';
export default async function handler(request, response) {
    const lotOccupancyId = await copyLotOccupancy(request.body.lotOccupancyId, request.session.user);
    response.json({
        success: true,
        lotOccupancyId
    });
}
