import assert from 'node:assert';
import { after, before, describe, it } from 'node:test';
import { dateToString } from '@cityssm/utils-datetime';
import updateSetting from '../database/updateSetting.js';
import { getCachedSetting } from '../helpers/cache/settings.cache.js';
import { clearCacheByTableName } from '../helpers/cache.helpers.js';
import { getUpcomingStatHolidays, getWorkOrderStatHolidaySettings, statHolidaySettingKeys, updateWorkOrderStatHolidaySettings } from '../helpers/statHolidays.helpers.js';
await describe('helpers/statHolidays', async () => {
    const settingKeys = Object.values(statHolidaySettingKeys);
    const originalSettingValues = {};
    before(() => {
        clearCacheByTableName('SunriseSettings');
        for (const settingKey of settingKeys) {
            originalSettingValues[settingKey] = getCachedSetting(settingKey).settingValue ?? '';
        }
    });
    after(() => {
        for (const settingKey of settingKeys) {
            updateSetting({
                settingKey,
                settingValue: originalSettingValues[settingKey] ?? ''
            });
        }
        clearCacheByTableName('SunriseSettings');
    });
    await it('cleans up past stat holiday override dates', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        updateSetting({
            settingKey: statHolidaySettingKeys.additionalDates,
            settingValue: `${dateToString(yesterday)},${dateToString(tomorrow)},invalid`
        });
        updateSetting({
            settingKey: statHolidaySettingKeys.ignoredDates,
            settingValue: `${dateToString(yesterday)},${dateToString(tomorrow)}`
        });
        const settings = getWorkOrderStatHolidaySettings();
        assert.deepStrictEqual(settings.additionalDateStrings, [dateToString(tomorrow)], 'Expected only upcoming additional dates to remain');
        assert.deepStrictEqual(settings.ignoredDateStrings, [dateToString(tomorrow)], 'Expected only upcoming ignored dates to remain');
        const storedAdditionalDates = getCachedSetting(statHolidaySettingKeys.additionalDates).settingValue ?? '';
        assert.strictEqual(storedAdditionalDates, dateToString(tomorrow), 'Expected cleaned additional dates to be persisted as CSV');
    });
    await it('applies location and type settings while allowing overrides', () => {
        const startDate = new Date();
        const additionalDate = new Date(startDate);
        additionalDate.setDate(startDate.getDate() + 30);
        const additionalDateString = dateToString(additionalDate);
        updateWorkOrderStatHolidaySettings({
            country: 'CA',
            region: '',
            state: 'ON',
            types: ['public']
        });
        const baselineHolidays = getUpcomingStatHolidays(getWorkOrderStatHolidaySettings(), startDate);
        const ignoredDateString = baselineHolidays.find((holiday) => holiday.isFromPackage)?.dateString ?? '';
        updateSetting({
            settingKey: statHolidaySettingKeys.additionalDates,
            settingValue: additionalDateString
        });
        updateSetting({
            settingKey: statHolidaySettingKeys.ignoredDates,
            settingValue: ignoredDateString
        });
        const settings = getWorkOrderStatHolidaySettings();
        const upcomingStatHolidays = getUpcomingStatHolidays(settings, startDate);
        assert.strictEqual(settings.country, 'CA', 'Expected country to be saved');
        assert.strictEqual(settings.state, 'ON', 'Expected state to be saved');
        assert.ok(settings.types.includes('public'), 'Expected selected holiday type to be included');
        assert.ok(upcomingStatHolidays.some((holiday) => holiday.dateString === additionalDateString && holiday.isAdditional), 'Expected additional stat holiday date to appear');
        if (ignoredDateString !== '') {
            assert.ok(!upcomingStatHolidays.some((holiday) => holiday.dateString === ignoredDateString), 'Expected ignored package holiday date to be excluded');
        }
    });
});
