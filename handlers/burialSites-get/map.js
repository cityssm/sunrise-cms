import getCemeteries from '../../database/getCemeteries.js';
export default function handler(request, response) {
    const cemeteries = getCemeteries();
    response.render('burialSites/map', {
        headTitle: 'Burial Site Map (Beta)',
        cemeteries,
        cemeteryId: request.query.cemeteryId ?? ''
    });
}
