import sqlite from 'better-sqlite3';
import type { UserSettingKey } from '../types/user.types.js';
export interface UpdateSettingForm {
    settingKey: string;
    settingValue: string;
}
export default function updateUserSetting(userName: string, settingKey: UserSettingKey, settingValue: string, connectedDatabase?: sqlite.Database): boolean;
export declare function updateApiKeyUserSetting(userName: string, connectedDatabase?: sqlite.Database): string;
