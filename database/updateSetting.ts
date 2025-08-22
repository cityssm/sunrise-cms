import sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

export interface UpdateSettingForm {
  settingKey: string
  settingValue: string
}

export default function updateSetting(updateForm: UpdateSettingForm, connectedDatabase?: sqlite.Database): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  let result = database
    .prepare(
      `update SunriseSettings
        set settingValue = ?,
          previousSettingValue = settingValue,
          recordUpdate_timeMillis = ?
        where settingKey = ?`
    )
    .run(updateForm.settingValue, Date.now(), updateForm.settingKey)

  if (result.changes <= 0) {
    result = database
      .prepare(
        `insert into SunriseSettings (settingKey, settingValue, recordUpdate_timeMillis)
          values (?, ?, ?)`
      )
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
