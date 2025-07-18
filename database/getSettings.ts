import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { Setting } from '../types/record.types.js'
import {
  type SettingProperties,
  settingProperties
} from '../types/setting.types.js'

export default function getSettings(): Array<Partial<Setting> & SettingProperties> {
  const database = sqlite(sunriseDB, { readonly: true })

  const databaseSettings = database
    .prepare(
      `select s.settingKey, s.settingValue, s.previousSettingValue,
        s.recordUpdate_timeMillis
        from SunriseSettings s`
    )
    .all() as Setting[]

  const settings: Array<Partial<Setting> & SettingProperties> = [
    ...settingProperties
  ]

  for (const databaseSetting of databaseSettings) {
    const settingKey = databaseSetting.settingKey

    const setting = settings.find(
      (property) => property.settingKey === settingKey
    )

    if (setting !== undefined) {
      Object.assign(setting, databaseSetting)
    }
  }

  return settings
}
