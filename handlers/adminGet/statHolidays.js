import { i18next } from '../../helpers/i18n.helpers.js';
import { getHolidayLocationOptions, getHolidayTypeLabels, getHolidayTypes, getUpcomingStatHolidays, getWorkOrderStatHolidaySettings } from '../../helpers/statHolidays.helpers.js';
export default function handler(_request, response) {
    const statHolidaySettings = getWorkOrderStatHolidaySettings();
    const holidayLocationOptions = getHolidayLocationOptions(statHolidaySettings);
    const upcomingStatHolidays = getUpcomingStatHolidays(statHolidaySettings);
    response.render('admin/statHolidays', {
        headTitle: i18next.t('admin:statHolidayManagement', {
            lng: response.locals.lng
        }),
        statHolidaySettings,
        countryOptions: holidayLocationOptions.countries,
        regionOptions: holidayLocationOptions.regions,
        stateOptions: holidayLocationOptions.states,
        holidayTypeLabels: getHolidayTypeLabels(),
        holidayTypes: getHolidayTypes(),
        ignoredDateStrings: statHolidaySettings.ignoredDateStrings,
        upcomingStatHolidays
    });
}
