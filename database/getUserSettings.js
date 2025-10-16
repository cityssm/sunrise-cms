import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
import { updateApiKeyUserSetting } from './updateUserSetting.js';
export default function getUserSettings(userName, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
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
        settings.apiKey = updateApiKeyUserSetting(userName, database);
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return settings;
}
