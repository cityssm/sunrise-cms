import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { UserSettingKey } from '../types/user.types.js'

export default function getUserSettings(
  userName: string
): Partial<Record<UserSettingKey, string>> {
  const database = sqlite(sunriseDB, { readonly: true })

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

  return settings
}
