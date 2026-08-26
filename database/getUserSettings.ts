import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { UserSettingKey } from '../types/user.types.js'

import { updateApiKeyUserSetting } from './updateUserSetting.js'

export default function getUserSettings(
  username: string,
  connectedDatabase?: sqlite.Database
): Partial<Record<UserSettingKey, string>> {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const databaseSettings = database
    .prepare(/* sql */ `
      SELECT
        s.settingKey,
        s.settingValue
      FROM
        UserSettings s
      WHERE
        s.username = ?
    `)
    .all(username) as Array<{
    settingKey: UserSettingKey
    settingValue: string
  }>

  const settings: Partial<Record<UserSettingKey, string>> = {}

  for (const databaseSetting of databaseSettings) {
    const settingKey = databaseSetting.settingKey

    settings[settingKey] = databaseSetting.settingValue
  }

  if ((settings.apiKey ?? '') === '') {
    settings.apiKey = updateApiKeyUserSetting(username, database)
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return settings
}
