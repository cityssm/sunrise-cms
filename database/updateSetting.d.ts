import sqlite from 'better-sqlite3';
export interface UpdateSettingForm {
    settingKey: string;
    settingValue: string;
}
export default function updateSetting(updateForm: UpdateSettingForm, connectedDatabase?: sqlite.Database): boolean;
