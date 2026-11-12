import { getHolidayLocationOptionsByCountryState } from '../../helpers/statHolidays.helpers.js';
export default function handler(request, response) {
    const locationOptions = getHolidayLocationOptionsByCountryState(request.body.country ?? '', request.body.state ?? '');
    response.json({
        ...locationOptions,
        success: true
    });
}
