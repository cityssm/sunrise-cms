import { getCachedBurialSiteStatuses } from '../../helpers/cache/burialSiteStatuses.cache.js';
import { getCachedCommittalTypes } from '../../helpers/cache/committalTypes.cache.js';
import { getCachedIntermentContainerTypes } from '../../helpers/cache/intermentContainerTypes.cache.js';
import { getCachedWorkOrderMilestoneTypes } from '../../helpers/cache/workOrderMilestoneTypes.cache.js';
import { getCachedWorkOrderTypes } from '../../helpers/cache/workOrderTypes.cache.js';
export default function handler(_request, response) {
    const burialSiteStatuses = getCachedBurialSiteStatuses();
    const committalTypes = getCachedCommittalTypes();
    const intermentContainerTypes = getCachedIntermentContainerTypes();
    const workOrderMilestoneTypes = getCachedWorkOrderMilestoneTypes();
    const workOrderTypes = getCachedWorkOrderTypes();
    response.render('admin/tables', {
        headTitle: 'Config Table Management',
        burialSiteStatuses,
        committalTypes,
        intermentContainerTypes,
        workOrderMilestoneTypes,
        workOrderTypes
    });
}
