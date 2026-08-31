import getContracts from '../../database/getContracts.js';
export default async function handler(request, response) {
    const result = await getContracts(request.body, {
        limit: request.body.limit,
        offset: request.body.offset,
        includeFees: false,
        includeInterments: true,
        includeTransactions: false
    });
    response.json({
        contracts: result.contracts,
        count: result.count,
        offset: typeof request.body.offset === 'string'
            ? Math.trunc(Number(request.body.offset))
            : request.body.offset
    });
}
