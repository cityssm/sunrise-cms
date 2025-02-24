import getFeeCategories from '../../database/getFeeCategories.js';
import { getBurialSiteTypes, getContractTypes } from '../../helpers/functions.cache.js';
export default async function handler(_request, response) {
    const feeCategories = await getFeeCategories({}, {
        includeFees: true
    });
    const occupancyTypes = await getContractTypes();
    const lotTypes = await getBurialSiteTypes();
    response.render('admin-fees', {
        headTitle: 'Fee Management',
        feeCategories,
        occupancyTypes,
        lotTypes
    });
}
