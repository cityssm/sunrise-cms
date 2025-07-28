import type { UserSettingKey } from '../types/user.types.js';
export default function getUserSettings(userName: string): Partial<Record<UserSettingKey, string>>;
