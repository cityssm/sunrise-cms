import getSettingsFromDatabase from '../../database/getSettings.js';
let settings;
export function getCachedSettings() {
    settings ??= getSettingsFromDatabase();
    return settings;
}
export function getCachedSetting(settingKey) {
    const cachedSettings = getCachedSettings();
    return cachedSettings.find((setting) => setting.settingKey === settingKey);
}
export function getCachedSettingValue(settingKey) {
    const setting = getCachedSetting(settingKey);
    let settingValue = setting.settingValue ?? '';
    if (settingValue === '') {
        settingValue = setting.defaultValue;
    }
    return settingValue;
}
export function clearSettingsCache() {
    settings = undefined;
}
