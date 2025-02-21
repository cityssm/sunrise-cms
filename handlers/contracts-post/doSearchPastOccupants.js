import getPastLotOccupancyOccupants from '../../database/getPastLotOccupancyOccupants.js';
export default async function handler(request, response) {
    const occupants = await getPastLotOccupancyOccupants(request.body, {
        limit: Number.parseInt(request.body.limit, 10)
    });
    response.json({
        occupants
    });
}
