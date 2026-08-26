import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
import updateUserSetting from './updateUserSetting.js';
export function updateConsignoCloudUserSettings(updateForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    updateUserSetting(user.username, 'consignoCloud.username', updateForm.username, database);
    if (updateForm.thirdPartyApplicationPassword !== '') {
        updateUserSetting(user.username, 'consignoCloud.thirdPartyApplicationPassword', updateForm.thirdPartyApplicationPassword, database);
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return true;
}
