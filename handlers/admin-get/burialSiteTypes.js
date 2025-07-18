import { getBurialSiteTypes } from '../../helpers/cache.helpers.js';
export default function handler(_request, response) {
    const burialSiteTypes = getBurialSiteTypes();
    response.render('admin-burialSiteTypes', {
        headTitle: "Burial Site Type Management",
        burialSiteTypes
    });
}
