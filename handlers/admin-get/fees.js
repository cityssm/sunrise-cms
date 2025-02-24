import getFeeCategories from '../../database/getFeeCategories.js';
import { getBurialSiteTypes, getContractTypes } from '../../helpers/functions.cache.js';
export default async function handler(_request, response) {
    const feeCategories = await getFeeCategories({}, {
        includeFees: true
    });
    const contractTypes = await getContractTypes();
    const burialSiteTypes = await getBurialSiteTypes();
    response.render('admin-fees', {
        headTitle: 'Fee Management',
        feeCategories,
        contractTypes,
        burialSiteTypes
    });
}
