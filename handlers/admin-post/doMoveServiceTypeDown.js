import { moveRecordDown } from '../../database/moveRecord.js';
import { getCachedServiceTypes } from '../../helpers/cache/serviceTypes.cache.js';
export default function handler(request, response) {
    const isSuccessful = moveRecordDown('ServiceTypes', request.body.serviceTypeId, request.body.moveToEnd === '1');
    if (isSuccessful) {
        const serviceTypes = getCachedServiceTypes();
        response.json({
            success: true,
            serviceTypes
        });
    }
    else {
        response.json({
            success: false,
            errorMessage: 'Service Type Not Moved'
        });
    }
}
