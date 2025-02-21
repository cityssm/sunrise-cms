import addLotOccupancy from '../../database/addLotOccupancy.js';
export default async function handler(request, response) {
    const lotOccupancyId = await addLotOccupancy(request.body, request.session.user);
    response.json({
        success: true,
        lotOccupancyId
    });
}
