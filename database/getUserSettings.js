import sqlite from 'better-sqlite3';
import { generateApiKey } from '../helpers/api.helpers.js';
import { clearCacheByTableName } from '../helpers/cache.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import updateUserSetting from './updateUserSetting.js';
export default function getUserSettings(userName) {
    const database = sqlite(sunriseDB);
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
    if ((settings.apiKey ?? '') === '') {
        settings.apiKey = generateApiKey(userName);
        updateUserSetting(userName, 'apiKey', settings.apiKey, database);
        clearCacheByTableName('UserSettings');
    }
    database.close();
    return settings;
}
