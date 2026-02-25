import { dateToString, dateToTimePeriodString } from '@cityssm/utils-datetime';
import { getLastBackupDate } from '../../helpers/database.helpers.js';
import { i18next } from '../../helpers/i18n.helpers.js';
export default async function handler(_request, response) {
    const lastBackupDate = await getLastBackupDate();
    const lastBackupDateString = lastBackupDate === undefined ? '' : dateToString(lastBackupDate);
    const lastBackupTimePeriodString = lastBackupDate === undefined ? '' : dateToTimePeriodString(lastBackupDate);
    response.render('admin/database', {
        headTitle: i18next.t('admin:databaseMaintenance', { lng: response.locals.lng }),
        lastBackupDateString,
        lastBackupTimePeriodString
    });
}
