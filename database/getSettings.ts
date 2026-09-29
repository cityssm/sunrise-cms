import { DatabaseSync } from 'node:sqlite'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { Setting } from '../types/record.types.js'
import {
  type SettingProperties,
  settingProperties
} from '../types/setting.types.js'

export default function getSettings(
  connectedDatabase?: DatabaseSync
): Array<Partial<Setting> & SettingProperties> {
  const database = connectedDatabase ?? new DatabaseSync(sunriseDB)

  const databaseSettings = database
    .prepare(/* sql */ `
      SELECT
        s.settingKey,
        s.settingValue,
        s.previousSettingValue,
        s.recordUpdate_timeMillis
      FROM
        SunriseSettings s
    `)
    .all() as unknown as Setting[]

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

  if (connectedDatabase === undefined) {
    database.close()
  }

  return settings
}
