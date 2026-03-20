import sqlite from 'better-sqlite3'

import { generateApiKey } from '../helpers/api.helpers.js'
import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'
import type { UserSettingKey } from '../types/user.types.js'

export interface UpdateSettingForm {
  settingKey: string
  settingValue: string
}

export default function updateUserSetting(
  userName: string,
  settingKey: UserSettingKey,
  settingValue: string,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  let result = database
    .prepare(/* sql */ `
      UPDATE UserSettings
      SET
        settingValue = ?,
        previousSettingValue = settingValue,
        recordUpdate_timeMillis = ?
      WHERE
        userName = ?
        AND settingKey = ?
    `)
    .run(settingValue, Date.now(), userName, settingKey)

  if (result.changes <= 0) {
    result = database
      .prepare(/* sql */ `
        INSERT INTO
          UserSettings (
            userName,
            settingKey,
            settingValue,
            recordUpdate_timeMillis
          )
        VALUES
          (?, ?, ?, ?)
      `)
      .run(userName, settingKey, settingValue, Date.now())
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result.changes > 0
}

export function updateApiKeyUserSetting(
  userName: string,
  connectedDatabase?: sqlite.Database
): string {
  if (userName === '') {
    throw new Error('Cannot update API key for empty user name')
  }

  const apiKey = generateApiKey(userName)

  updateUserSetting(userName, 'apiKey', apiKey, connectedDatabase)

  clearCacheByTableName('UserSettings')

  return apiKey
}
