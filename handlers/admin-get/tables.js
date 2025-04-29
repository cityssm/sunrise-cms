import { getBurialSiteStatuses, getCommittalTypes, getIntermentContainerTypes, getWorkOrderMilestoneTypes, getWorkOrderTypes } from '../../helpers/functions.cache.js';
export default function handler(_request, response) {
    const burialSiteStatuses = getBurialSiteStatuses();
    const committalTypes = getCommittalTypes();
    const intermentContainerTypes = getIntermentContainerTypes();
    const workOrderMilestoneTypes = getWorkOrderMilestoneTypes();
    const workOrderTypes = getWorkOrderTypes();
    response.render('admin-tables', {
        headTitle: 'Config Table Management',
        burialSiteStatuses,
        committalTypes,
        intermentContainerTypes,
        workOrderMilestoneTypes,
        workOrderTypes
    });
}
