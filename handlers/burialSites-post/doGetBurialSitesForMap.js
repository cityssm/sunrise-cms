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
    const result = getBurialSitesForMap(cemeteryId ?? '');
    response.json({
        ...result,
        success: true
    });
}
