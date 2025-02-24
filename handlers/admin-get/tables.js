import { getSolidIconClasses } from '@cityssm/font-awesome-v5-iconclasses';
import { getBurialSiteStatuses, getWorkOrderMilestoneTypes, getWorkOrderTypes } from '../../helpers/functions.cache.js';
export default async function handler(_request, response) {
    const workOrderTypes = await getWorkOrderTypes();
    const workOrderMilestoneTypes = await getWorkOrderMilestoneTypes();
    const burialSiteStatuses = await getBurialSiteStatuses();
    const fontAwesomeIconClasses = await getSolidIconClasses();
    response.render('admin-tables', {
        headTitle: 'Config Table Management',
        workOrderTypes,
        workOrderMilestoneTypes,
        burialSiteStatuses,
        fontAwesomeIconClasses
    });
}
