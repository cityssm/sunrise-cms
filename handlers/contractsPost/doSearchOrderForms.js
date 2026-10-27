import getOrderForms from '../../database/getOrderForms.js';
import { getCachedContractTypeById } from '../../helpers/cache/contractTypes.cache.js';
export default function handler(request, response) {
    const filters = {};
    const processedFilter = request.body.isOrderFormProcessed;
    if (processedFilter === 'processed') {
        filters.isOrderFormProcessed = true;
    }
    else if (processedFilter === 'notProcessed') {
        filters.isOrderFormProcessed = false;
    }
    else if (typeof processedFilter === 'boolean') {
        filters.isOrderFormProcessed = processedFilter;
    }
    if (request.body.contractTypeId !== undefined && `${request.body.contractTypeId}` !== '') {
        const contractTypeId = Math.trunc(Number(request.body.contractTypeId));
        if (Number.isFinite(contractTypeId)) {
            filters.contractTypeId = contractTypeId;
            filters.contractTypeName =
                getCachedContractTypeById(contractTypeId)?.contractType ?? '';
        }
    }
    if (typeof request.body.deceasedName === 'string' && request.body.deceasedName.trim() !== '') {
        filters.deceasedName = request.body.deceasedName.trim();
    }
    if (typeof request.body.purchaserName === 'string' && request.body.purchaserName.trim() !== '') {
        filters.purchaserName = request.body.purchaserName.trim();
    }
    const result = getOrderForms(filters, {
        limit: request.body.limit,
        offset: request.body.offset
    });
    if (Array.isArray(result)) {
        response.json({
            orderForms: result,
            count: result.length,
            offset: 0
        });
        return;
    }
    response.json({
        orderForms: result.orderForms,
        count: result.count,
        offset: typeof request.body.offset === 'string'
            ? Math.trunc(Number(request.body.offset))
            : request.body.offset ?? 0
    });
}
