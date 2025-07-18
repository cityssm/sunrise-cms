import getFeeCategories from '../../database/getFeeCategories.js';
import { getBurialSiteTypes, getContractTypes } from '../../helpers/cache.helpers.js';
export default function handler(_request, response) {
    const feeCategories = getFeeCategories({}, {
        includeFees: true
    });
    const contractTypes = getContractTypes();
    const burialSiteTypes = getBurialSiteTypes();
    response.render('admin-fees', {
        headTitle: 'Fee Management',
        burialSiteTypes,
        contractTypes,
        feeCategories
    });
}
