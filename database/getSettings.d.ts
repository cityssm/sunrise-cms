import type { Setting } from '../types/record.types.js';
import { type SettingProperties } from '../types/setting.types.js';
export default function getSettings(): Array<Partial<Setting> & SettingProperties>;
