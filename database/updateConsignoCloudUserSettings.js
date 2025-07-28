import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
import updateUserSetting from './updateUserSetting.js';
export function updateConsignoCloudUserSettings(updateForm, user) {
    const database = sqlite(sunriseDB);
    updateUserSetting(user.userName, 'consignoCloud.userName', updateForm.userName, database);
    if (updateForm.thirdPartyApplicationPassword !== '') {
        updateUserSetting(user.userName, 'consignoCloud.thirdPartyApplicationPassword', updateForm.thirdPartyApplicationPassword, database);
    }
    database.close();
    return true;
}
