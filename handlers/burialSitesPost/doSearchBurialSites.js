import getBurialSites from '../../database/getBurialSites.js';
export default function handler(request, response) {
    const result = getBurialSites(request.body, {
        limit: request.body.limit,
        offset: request.body.offset,
        includeContractCount: true
    });
    response.json({
        burialSites: result.burialSites,
        count: result.count,
        offset: typeof request.body.offset === 'string'
            ? Math.trunc(Number(request.body.offset))
            : request.body.offset
    });
}
