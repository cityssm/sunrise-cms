import getLots from '../../database/getLots.js';
export default async function handler(request, response) {
    const result = await getLots(request.body, {
        limit: request.body.limit,
        offset: request.body.offset,
        includeLotOccupancyCount: true
    });
    response.json({
        count: result.count,
        offset: Number.parseInt(request.body.offset, 10),
        lots: result.lots
    });
}
