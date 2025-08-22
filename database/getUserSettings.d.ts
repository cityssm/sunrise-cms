import sqlite from 'better-sqlite3';
import type { UserSettingKey } from '../types/user.types.js';
export default function getUserSettings(userName: string, connectedDatabase?: sqlite.Database): Partial<Record<UserSettingKey, string>>;
