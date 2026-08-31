import { randomBytes } from 'node:crypto';
import updateSetting from '../database/updateSetting.js';
import { getCachedSettingValue } from './cache/settings.cache.js';
export function getWorkOrderWorkDayRanges() {
    return {
        0: {
            endHour: getCachedSettingValue('workOrder.workDay.0.endHour') === ''
                ? -1
                : Math.trunc(Number(getCachedSettingValue('workOrder.workDay.0.endHour'))),
            startHour: getCachedSettingValue('workOrder.workDay.0.startHour') === ''
                ? -1
                : Math.trunc(Number(getCachedSettingValue('workOrder.workDay.0.startHour')))
        },
        1: {
            endHour: getCachedSettingValue('workOrder.workDay.1.endHour') === ''
                ? -1
                : Math.trunc(Number(getCachedSettingValue('workOrder.workDay.1.endHour'))),
            startHour: getCachedSettingValue('workOrder.workDay.1.startHour') === ''
                ? -1
                : Math.trunc(Number(getCachedSettingValue('workOrder.workDay.1.startHour')))
        },
        2: {
            endHour: getCachedSettingValue('workOrder.workDay.2.endHour') === ''
                ? -1
                : Math.trunc(Number(getCachedSettingValue('workOrder.workDay.2.endHour'))),
            startHour: getCachedSettingValue('workOrder.workDay.2.startHour') === ''
                ? -1
                : Math.trunc(Number(getCachedSettingValue('workOrder.workDay.2.startHour')))
        },
        3: {
            endHour: getCachedSettingValue('workOrder.workDay.3.endHour') === ''
                ? -1
                : Math.trunc(Number(getCachedSettingValue('workOrder.workDay.3.endHour'))),
            startHour: getCachedSettingValue('workOrder.workDay.3.startHour') === ''
                ? -1
                : Math.trunc(Number(getCachedSettingValue('workOrder.workDay.3.startHour')))
        },
        4: {
            endHour: getCachedSettingValue('workOrder.workDay.4.endHour') === ''
                ? -1
                : Math.trunc(Number(getCachedSettingValue('workOrder.workDay.4.endHour'))),
            startHour: getCachedSettingValue('workOrder.workDay.4.startHour') === ''
                ? -1
                : Math.trunc(Number(getCachedSettingValue('workOrder.workDay.4.startHour')))
        },
        5: {
            endHour: getCachedSettingValue('workOrder.workDay.5.endHour') === ''
                ? -1
                : Math.trunc(Number(getCachedSettingValue('workOrder.workDay.5.endHour'))),
            startHour: getCachedSettingValue('workOrder.workDay.5.startHour') === ''
                ? -1
                : Math.trunc(Number(getCachedSettingValue('workOrder.workDay.5.startHour')))
        },
        6: {
            endHour: getCachedSettingValue('workOrder.workDay.6.endHour') === ''
                ? -1
                : Math.trunc(Number(getCachedSettingValue('workOrder.workDay.6.endHour'))),
            startHour: getCachedSettingValue('workOrder.workDay.6.startHour') === ''
                ? -1
                : Math.trunc(Number(getCachedSettingValue('workOrder.workDay.6.startHour')))
        }
    };
}
export function getCsrfSecret() {
    let csrfSecret = getCachedSettingValue('application.csrfSecret');
    if (csrfSecret === '') {
        csrfSecret = randomBytes(64).toString('hex');
        updateSetting({
            settingKey: 'application.csrfSecret',
            settingValue: csrfSecret
        });
    }
    return csrfSecret;
}
