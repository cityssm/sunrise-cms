import { randomBytes } from 'node:crypto';
import updateSetting from '../database/updateSetting.js';
import { getCachedSettingValue } from './cache/settings.cache.js';
export function getWorkOrderWorkDayRanges() {
    return {
        0: {
            endHour: getCachedSettingValue('workOrder.workDay.0.endHour') === ''
                ? -1
                : Number.parseInt(getCachedSettingValue('workOrder.workDay.0.endHour'), 10),
            startHour: getCachedSettingValue('workOrder.workDay.0.startHour') === ''
                ? -1
                : Number.parseInt(getCachedSettingValue('workOrder.workDay.0.startHour'), 10)
        }, // Sunday
        1: {
            endHour: getCachedSettingValue('workOrder.workDay.1.endHour') === ''
                ? -1
                : Number.parseInt(getCachedSettingValue('workOrder.workDay.1.endHour'), 10),
            startHour: getCachedSettingValue('workOrder.workDay.1.startHour') === ''
                ? -1
                : Number.parseInt(getCachedSettingValue('workOrder.workDay.1.startHour'), 10)
        }, // Monday
        2: {
            endHour: getCachedSettingValue('workOrder.workDay.2.endHour') === ''
                ? -1
                : Number.parseInt(getCachedSettingValue('workOrder.workDay.2.endHour'), 10),
            startHour: getCachedSettingValue('workOrder.workDay.2.startHour') === ''
                ? -1
                : Number.parseInt(getCachedSettingValue('workOrder.workDay.2.startHour'), 10)
        }, // Tuesday
        3: {
            endHour: getCachedSettingValue('workOrder.workDay.3.endHour') === ''
                ? -1
                : Number.parseInt(getCachedSettingValue('workOrder.workDay.3.endHour'), 10),
            startHour: getCachedSettingValue('workOrder.workDay.3.startHour') === ''
                ? -1
                : Number.parseInt(getCachedSettingValue('workOrder.workDay.3.startHour'), 10)
        }, // Wednesday
        4: {
            endHour: getCachedSettingValue('workOrder.workDay.4.endHour') === ''
                ? -1
                : Number.parseInt(getCachedSettingValue('workOrder.workDay.4.endHour'), 10),
            startHour: getCachedSettingValue('workOrder.workDay.4.startHour') === ''
                ? -1
                : Number.parseInt(getCachedSettingValue('workOrder.workDay.4.startHour'), 10)
        }, // Thursday
        5: {
            endHour: getCachedSettingValue('workOrder.workDay.5.endHour') === ''
                ? -1
                : Number.parseInt(getCachedSettingValue('workOrder.workDay.5.endHour'), 10),
            startHour: getCachedSettingValue('workOrder.workDay.5.startHour') === ''
                ? -1
                : Number.parseInt(getCachedSettingValue('workOrder.workDay.5.startHour'), 10)
        }, // Friday
        6: {
            endHour: getCachedSettingValue('workOrder.workDay.6.endHour') === ''
                ? -1
                : Number.parseInt(getCachedSettingValue('workOrder.workDay.6.endHour'), 10),
            startHour: getCachedSettingValue('workOrder.workDay.6.startHour') === ''
                ? -1
                : Number.parseInt(getCachedSettingValue('workOrder.workDay.6.startHour'), 10)
        } // Saturday
    };
}
export function getCsrfSecret() {
    let csrfSecret = getCachedSettingValue('application.csrfSecret');
    if (csrfSecret === '') {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        csrfSecret = randomBytes(64).toString('hex');
        updateSetting({
            settingKey: 'application.csrfSecret',
            settingValue: csrfSecret
        });
    }
    return csrfSecret;
}
