import { DatabaseSync } from 'node:sqlite';
import { clearCacheByTableName } from '../helpers/cache.helpers.js';
import { databaseBusyTimeout, sunriseDB } from '../helpers/database.helpers.js';
export default function updateSetting(updateForm, connectedDatabase) {
    const database = connectedDatabase ?? new DatabaseSync(sunriseDB, { timeout: databaseBusyTimeout });
    let result = database
        .prepare(`
      UPDATE SunriseSettings
      SET
        settingValue = ?,
        previousSettingValue = settingValue,
        recordUpdate_timeMillis = ?
      WHERE
        settingKey = ?
    `)
        .run(updateForm.settingValue, Date.now(), updateForm.settingKey);
    if (result.changes <= 0) {
        result = database
            .prepare(`
        INSERT INTO
          SunriseSettings (settingKey, settingValue, recordUpdate_timeMillis)
        VALUES
          (?, ?, ?)
      `)
            .run(updateForm.settingKey, updateForm.settingValue, Date.now());
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    if (result.changes > 0) {
        clearCacheByTableName('SunriseSettings');
    }
    return true;
}
