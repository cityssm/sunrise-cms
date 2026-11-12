import { updateWorkOrderStatHolidaySettings } from '../../helpers/statHolidays.helpers.js';
export default function handler(request, response) {
    const selectedTypes = request.body.types === undefined
        ? []
        : Array.isArray(request.body.types)
            ? request.body.types
            : [request.body.types];
    updateWorkOrderStatHolidaySettings({
        country: request.body.country ?? '',
        region: request.body.region ?? '',
        state: request.body.state ?? '',
        types: selectedTypes
    });
    response.json({
        success: true
    });
}
