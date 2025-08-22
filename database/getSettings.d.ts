import sqlite from 'better-sqlite3';
import type { Setting } from '../types/record.types.js';
import { type SettingProperties } from '../types/setting.types.js';
export default function getSettings(connectedDatabase?: sqlite.Database): Array<Partial<Setting> & SettingProperties>;
