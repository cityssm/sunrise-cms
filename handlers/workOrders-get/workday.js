import { dateToString } from '@cityssm/utils-datetime';
export default function handler(request, response) {
    response.render('workOrders/workday', {
        headTitle: 'Workday Report',
        workdayDateString: request.query.workdayDateString ?? dateToString(new Date())
    });
}
