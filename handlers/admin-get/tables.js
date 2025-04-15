import { getBurialSiteStatuses, getWorkOrderMilestoneTypes, getWorkOrderTypes } from '../../helpers/functions.cache.js';
export default async function handler(_request, response) {
    const workOrderTypes = await getWorkOrderTypes();
    const workOrderMilestoneTypes = await getWorkOrderMilestoneTypes();
    const burialSiteStatuses = await getBurialSiteStatuses();
    response.render('admin-tables', {
        headTitle: 'Config Table Management',
        burialSiteStatuses,
        workOrderMilestoneTypes,
        workOrderTypes
    });
}
