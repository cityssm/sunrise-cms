import getBurialSiteContracts from '../../database/getBurialSiteContracts.js';
export default async function handler(request, response) {
    const result = await getBurialSiteContracts(request.body, {
        limit: request.body.limit,
        offset: request.body.offset,
        includeInterments: true,
        includeFees: true,
        includeTransactions: true
    });
    response.json({
        count: result.count,
        offset: typeof request.body.offset === 'string'
            ? Number.parseInt(request.body.offset, 10)
            : request.body.offset,
        burialSiteContracts: result.burialSiteContracts
    });
}
