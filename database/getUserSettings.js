import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
import { updateApiKeyUserSetting } from './updateUserSetting.js';
export default function getUserSettings(username, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const databaseSettings = database
        .prepare(`
      SELECT
        s.settingKey,
        s.settingValue
      FROM
        UserSettings s
      WHERE
        s.username = ?
    `)
        .all(username);
    const settings = {};
    for (const databaseSetting of databaseSettings) {
        const settingKey = databaseSetting.settingKey;
        settings[settingKey] = databaseSetting.settingValue;
    }
    if ((settings.apiKey ?? '') === '') {
        settings.apiKey = updateApiKeyUserSetting(username, database);
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return settings;
}
