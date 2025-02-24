import { getBurialSiteTypes } from '../../helpers/functions.cache.js';
export default async function handler(_request, response) {
    const lotTypes = await getBurialSiteTypes();
    response.render('admin-burialSiteTypes', {
        headTitle: `Burial Site Type Management`,
        lotTypes
    });
}
