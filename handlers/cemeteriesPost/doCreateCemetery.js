import addCemetery from '../../database/addCemetery.js';
import { getCachedCemeteries } from '../../helpers/cache/cemeteries.cache.js';
export default function handler(request, response) {
    const cemeteryId = addCemetery(request.body, request.session.user);
    response.json({
        cemeteryId
    });
    response.on('finish', () => {
        getCachedCemeteries();
    });
}
