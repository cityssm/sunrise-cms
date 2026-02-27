import { updateBurialSiteLatitudeLongitude } from '../../database/updateBurialSite.js';
export default function handler(request, response) {
    try {
        const success = updateBurialSiteLatitudeLongitude(request.body.burialSiteId, request.body.burialSiteLatitude, request.body.burialSiteLongitude, request.session.user);
        response.json({
            success,
            errorMessage: success
                ? ''
                : 'Failed to update burial site latitude and longitude'
        });
    }
    catch (error) {
        response.json({
            success: false,
            errorMessage: error.message
        });
    }
}
