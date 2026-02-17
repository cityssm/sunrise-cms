import addServiceType from '../../database/addServiceType.js';
import { getCachedServiceTypes } from '../../helpers/cache/serviceTypes.cache.js';
export default function handler(request, response) {
    const serviceTypeId = addServiceType(request.body, request.session.user);
    const serviceTypes = getCachedServiceTypes();
    response.json({
        success: true,
        serviceTypeId,
        serviceTypes
    });
}
