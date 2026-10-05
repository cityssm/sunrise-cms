import { DatabaseSync } from 'node:sqlite'

import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { busyTimeout, sunriseDB } from '../helpers/database.helpers.js'

export interface UpdateSettingForm {
  settingKey: string
  settingValue: string
}

export default function updateSetting(
  updateForm: UpdateSettingForm,
  connectedDatabase?: DatabaseSync
): boolean {
  const database =
    connectedDatabase ?? new DatabaseSync(sunriseDB, { timeout: busyTimeout })

  let result = database
    .prepare(/* sql */ `
      UPDATE SunriseSettings
      SET
        settingValue = ?,
        previousSettingValue = settingValue,
        recordUpdate_timeMillis = ?
      WHERE
        settingKey = ?
    `)
    .run(updateForm.settingValue, Date.now(), updateForm.settingKey)

  if (result.changes <= 0) {
    result = database
      .prepare(/* sql */ `
        INSERT INTO
          SunriseSettings (settingKey, settingValue, recordUpdate_timeMillis)
        VALUES
          (?, ?, ?)
      `)
      .run(updateForm.settingKey, updateForm.settingValue, Date.now())
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  if (result.changes > 0) {
    clearCacheByTableName('SunriseSettings')
  }

  return true
}
