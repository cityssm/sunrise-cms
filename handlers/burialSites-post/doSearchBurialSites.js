import getBurialSites from '../../database/getBurialSites.js';
export default async function handler(request, response) {
    const result = await getBurialSites(request.body, {
        limit: request.body.limit,
        offset: request.body.offset,
        includeBurialSiteContractCount: true
    });
    response.json({
        count: result.count,
        offset: typeof request.body.offset === 'string'
            ? Number.parseInt(request.body.offset, 10)
            : request.body.offset,
        burialSites: result.burialSites
    });
}
