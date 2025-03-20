import { dateToString } from '@cityssm/utils-datetime';
import getWorkOrderMilestones from '../../database/getWorkOrderMilestones.js';
export default async function handler(_request, response) {
    const currentDateString = dateToString(new Date());
    const workOrderMilestones = await getWorkOrderMilestones({
        workOrderMilestoneDateFilter: 'date',
        workOrderMilestoneDateString: currentDateString
    }, {
        orderBy: 'completion',
        includeWorkOrders: true
    });
    response.render('dashboard', {
        headTitle: 'Dashboard',
        workOrderMilestones
    });
}
