import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
const loginUsers = getConfigProperty('users.canLogin');
export default function getApiKeys(connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true });
    const databaseSettings = database
        .prepare(`
      SELECT
        s.userName,
        s.settingValue
      FROM
        UserSettings s
      WHERE
        s.settingKey = 'apiKey'
    `)
        .all();
    const apiKeys = {};
    for (const databaseSetting of databaseSettings) {
        const userName = databaseSetting.userName;
        if (!loginUsers.includes(userName)) {
            continue;
        }
        apiKeys[userName] = databaseSetting.settingValue;
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return apiKeys;
}
