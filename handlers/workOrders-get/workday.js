import { dateToString } from '@cityssm/utils-datetime';
export default function handler(request, response) {
    console.log(request.query.workdayDateString);
    response.render('workOrder-workday', {
        headTitle: 'Workday Report',
        workdayDateString: request.query.workdayDateString ?? dateToString(new Date())
    });
}
