import getBurialSitesForMap from '../../database/getBurialSitesForMap.js';
export default function handler(request, response) {
    const { cemeteryId } = request.body;
    // Cemetery is required
    if ((cemeteryId ?? '') === '') {
        response.json({
            errorMessage: 'Cemetery selection is required',
            success: false
        });
        return;
    }
    const burialSites = getBurialSitesForMap(cemeteryId);
    response.json({
        burialSites,
        success: true
    });
}
