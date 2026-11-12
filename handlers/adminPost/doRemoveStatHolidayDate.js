import { removeWorkOrderStatHolidayDate } from '../../helpers/statHolidays.helpers.js';
export default function handler(request, response) {
    if (request.body.settingKey !== 'additionalDates' &&
        request.body.settingKey !== 'ignoredDates') {
        response.json({
            success: false
        });
        return;
    }
    removeWorkOrderStatHolidayDate(request.body.settingKey, request.body.dateString);
    response.json({
        success: true
    });
}
