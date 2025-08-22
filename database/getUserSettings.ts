import sqlite from 'better-sqlite3'

import { generateApiKey } from '../helpers/api.helpers.js'
import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'
import type { UserSettingKey } from '../types/user.types.js'

import updateUserSetting from './updateUserSetting.js'

export default function getUserSettings(
  userName: string,
  connectedDatabase?: sqlite.Database
): Partial<Record<UserSettingKey, string>> {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const databaseSettings = database
    .prepare(
      `select s.settingKey, s.settingValue
        from UserSettings s
        where s.userName = ?`
    )
    .all(userName) as Array<{
    settingKey: UserSettingKey
    settingValue: string
  }>

  const settings: Partial<Record<UserSettingKey, string>> = {}

  for (const databaseSetting of databaseSettings) {
    const settingKey = databaseSetting.settingKey

    // eslint-disable-next-line security/detect-object-injection
    settings[settingKey] = databaseSetting.settingValue
  }

  if ((settings.apiKey ?? '') === '') {
    settings.apiKey = generateApiKey(userName)
    updateUserSetting(userName, 'apiKey', settings.apiKey, database)
    clearCacheByTableName('UserSettings')
  }

  if (connectedDatabase === undefined) {
    database.close()
  }
  
  return settings
}
