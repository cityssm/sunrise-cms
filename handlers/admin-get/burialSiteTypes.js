import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js';
export default function handler(_request, response) {
    const burialSiteTypes = getCachedBurialSiteTypes();
    response.render('admin/burialSiteTypes', {
        headTitle: "Burial Site Type Management",
        burialSiteTypes
    });
}
