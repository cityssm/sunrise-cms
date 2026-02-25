import getCemeteries from '../../database/getCemeteries.js';
import { i18next } from '../../helpers/i18n.helpers.js';
export default function handler(request, response) {
    const cemeteries = getCemeteries();
    response.render('burialSites/map', {
        headTitle: i18next.t('cemeteries:burialSiteMap', { lng: response.locals.lng }),
        cemeteries,
        cemeteryId: request.query.cemeteryId ?? ''
    });
}
