import { DatabaseSync } from 'node:sqlite'

import { generateApiKey } from '../helpers/api.helpers.js'
import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'
import type { UserSettingKey } from '../types/user.types.js'

export interface UpdateSettingForm {
  settingKey: string
  settingValue: string
}

export default function updateUserSetting(
  username: string,
  settingKey: UserSettingKey,
  settingValue: string,
  connectedDatabase?: DatabaseSync
): boolean {
  const database = connectedDatabase ?? new DatabaseSync(sunriseDB)

  let result = database
    .prepare(/* sql */ `
      UPDATE UserSettings
      SET
        settingValue = ?,
        previousSettingValue = settingValue,
        recordUpdate_timeMillis = ?
      WHERE
        username = ?
        AND settingKey = ?
    `)
    .run(settingValue, Date.now(), username, settingKey)

  if (result.changes <= 0) {
    result = database
      .prepare(/* sql */ `
        INSERT INTO
          UserSettings (
            username,
            settingKey,
            settingValue,
            recordUpdate_timeMillis
          )
        VALUES
          (?, ?, ?, ?)
      `)
      .run(username, settingKey, settingValue, Date.now())
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result.changes > 0
}

export function updateApiKeyUserSetting(
  username: string,
  connectedDatabase?: DatabaseSync
): string {
  if (username === '') {
    throw new Error('Cannot update API key for empty user name')
  }

  const apiKey = generateApiKey(username)

  updateUserSetting(username, 'apiKey', apiKey, connectedDatabase)

  clearCacheByTableName('UserSettings')

  return apiKey
}
