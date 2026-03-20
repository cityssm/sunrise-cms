import updateServiceType from '../../database/updateServiceType.js';
import { getCachedServiceTypes } from '../../helpers/cache/serviceTypes.cache.js';
export default function handler(request, response) {
    const isSuccessful = updateServiceType(request.body, request.session.user);
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
            errorMessage: 'Service Type Not Updated'
        });
    }
}
