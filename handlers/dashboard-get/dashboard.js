import { dateToString } from '@cityssm/utils-datetime';
import getBurialSiteContracts from '../../database/getBurialSiteContracts.js';
import getWorkOrderMilestones from '../../database/getWorkOrderMilestones.js';
import { getWorkOrders } from '../../database/getWorkOrders.js';
export default async function handler(_request, response) {
    const currentDateString = dateToString(new Date());
    const workOrderMilestones = await getWorkOrderMilestones({
        workOrderMilestoneDateFilter: 'date',
        workOrderMilestoneDateString: currentDateString
    }, {
        orderBy: 'completion',
        includeWorkOrders: true
    });
    const workOrderResults = await getWorkOrders({
        workOrderOpenDateString: currentDateString
    }, {
        limit: 1, // only using the count
        offset: 0
    });
    const burialSiteContractResults = await getBurialSiteContracts({
        contractStartDateString: currentDateString
    }, {
        limit: 1, // only using the count
        offset: 0,
        includeFees: false,
        includeInterments: false,
        includeTransactions: false
    });
    response.render('dashboard', {
        headTitle: 'Dashboard',
        workOrderMilestones,
        workOrderCount: workOrderResults.count,
        burialSiteContractCount: burialSiteContractResults.count
    });
}
