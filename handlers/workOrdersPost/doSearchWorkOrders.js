import { getWorkOrders } from '../../database/getWorkOrders.js';
export default async function handler(request, response) {
    const result = await getWorkOrders(request.body, {
        limit: request.body.limit,
        offset: request.body.offset,
        includeBurialSites: true
    });
    response.json({
        count: result.count,
        offset: typeof request.body.offset === 'string'
            ? Number.parseInt(request.body.offset, 10)
            : request.body.offset,
        workOrders: result.workOrders
    });
}
