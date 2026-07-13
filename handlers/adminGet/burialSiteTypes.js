import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js';
import { i18next } from '../../helpers/i18n.helpers.js';
export default function handler(_request, response) {
    const burialSiteTypes = getCachedBurialSiteTypes();
    response.render('admin/burialSiteTypes', {
        headTitle: i18next.t('admin:burialSiteTypeManagement', { lng: response.locals.lng }),
        burialSiteTypes
    });
}
