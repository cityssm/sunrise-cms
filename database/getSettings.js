import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
import { settingProperties } from '../types/setting.types.js';
export default function getSettings(connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true });
    const databaseSettings = database
        .prepare(/* sql */ `
      SELECT
        s.settingKey,
        s.settingValue,
        s.previousSettingValue,
        s.recordUpdate_timeMillis
      FROM
        SunriseSettings s
    `)
        .all();
    const settings = [
        ...settingProperties
    ];
    for (const databaseSetting of databaseSettings) {
        const settingKey = databaseSetting.settingKey;
        const setting = settings.find((property) => property.settingKey === settingKey);
        if (setting !== undefined) {
            Object.assign(setting, databaseSetting);
        }
    }
    return settings;
}
