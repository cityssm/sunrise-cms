import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getUserSettings(userName) {
    const database = sqlite(sunriseDB, { readonly: true });
    const databaseSettings = database
        .prepare(`select s.settingKey, s.settingValue
        from UserSettings s
        where s.userName = ?`)
        .all(userName);
    const settings = {};
    for (const databaseSetting of databaseSettings) {
        const settingKey = databaseSetting.settingKey;
        // eslint-disable-next-line security/detect-object-injection
        settings[settingKey] = databaseSetting.settingValue;
    }
    return settings;
}
