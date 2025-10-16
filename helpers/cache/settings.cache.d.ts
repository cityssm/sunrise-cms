import type { Setting } from '../../types/record.types.js';
import type { SettingKey, SettingProperties } from '../../types/setting.types.js';
export declare function getCachedSettings(): Array<Partial<Setting> & SettingProperties>;
export declare function getCachedSetting(settingKey: SettingKey): Partial<Setting> & SettingProperties;
export declare function getCachedSettingValue(settingKey: SettingKey): string;
export declare function clearSettingsCache(): void;
