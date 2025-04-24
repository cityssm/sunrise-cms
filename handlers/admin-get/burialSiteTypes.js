import { getBurialSiteTypes } from '../../helpers/functions.cache.js';
export default function handler(_request, response) {
    const burialSiteTypes = getBurialSiteTypes();
    response.render('admin-burialSiteTypes', {
        headTitle: "Burial Site Type Management",
        burialSiteTypes
    });
}
