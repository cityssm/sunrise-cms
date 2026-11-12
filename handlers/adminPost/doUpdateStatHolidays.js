import { updateWorkOrderStatHolidaySettings } from '../../helpers/statHolidays.helpers.js';
export default function handler(request, response) {
    let selectedTypes;
    if (request.body.types === undefined) {
        selectedTypes = [];
    }
    else if (Array.isArray(request.body.types)) {
        selectedTypes = request.body.types;
    }
    else {
        selectedTypes = [request.body.types];
    }
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
