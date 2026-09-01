import getSettingsFromDatabase from '../../database/getSettings.js'
import type { Setting } from '../../types/record.types.js'
import type {
  SettingKey,
  SettingProperties
} from '../../types/setting.types.js'

const cache: {
  settings: Array<Partial<Setting> & SettingProperties> | undefined
} = {
  settings: undefined
}

export function getCachedSettings(): Array<
  Partial<Setting> & SettingProperties
> {
  cache.settings ??= getSettingsFromDatabase()
  return cache.settings
}

export function getCachedSetting(
  settingKey: SettingKey
): Partial<Setting> & SettingProperties {
  const cachedSettings = getCachedSettings()
  return cachedSettings.find(
    (setting) => setting.settingKey === settingKey
  ) as Partial<Setting> & SettingProperties
}

export function getCachedSettingValue(settingKey: SettingKey): string {
  const setting = getCachedSetting(settingKey)

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (setting === undefined) {
    return ''
  }

  let settingValue = setting.settingValue ?? ''

  if (settingValue === '') {
    settingValue = setting.defaultValue
  }

  return settingValue
}

export function clearSettingsCache(): void {
  cache.settings = undefined
}
