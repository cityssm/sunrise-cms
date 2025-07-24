import fs from 'node:fs/promises';
import path from 'node:path';
import Debug from 'debug';
import { DEBUG_NAMESPACE } from '../debug.config.js';
import { getConfigProperty } from './config.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:database.helpers:${process.pid.toString().padEnd(5)}`);
export const useTestDatabases = getConfigProperty('application.useTestDatabases') ||
    process.env.TEST_DATABASES === 'true';
if (useTestDatabases) {
    debug('Using "-testing" databases.');
}
export const sunriseDBLive = 'data/sunrise.db';
export const sunriseDBTesting = 'data/sunrise-testing.db';
export const sunriseDB = useTestDatabases ? sunriseDBTesting : sunriseDBLive;
export const backupFolder = 'data/backups';
export function sanitizeLimit(limit) {
    const limitNumber = Number(limit);
    if (Number.isNaN(limitNumber) || limitNumber < 0) {
        return 50;
    }
    return Math.floor(limitNumber);
}
export function sanitizeOffset(offset) {
    const offsetNumber = Number(offset);
    if (Number.isNaN(offsetNumber) || offsetNumber < 0) {
        return 0;
    }
    return Math.floor(offsetNumber);
}
export async function getLastBackupDate() {
    let lastBackupDate = undefined;
    const filesInBackup = await fs.readdir(backupFolder);
    for (const file of filesInBackup) {
        if (!file.includes('.db.')) {
            continue;
        }
        const filePath = path.join(backupFolder, file);
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const stats = await fs.stat(filePath);
        if (lastBackupDate === undefined ||
            stats.mtime.getTime() > lastBackupDate.getTime()) {
            lastBackupDate = stats.mtime;
        }
    }
    return lastBackupDate;
}
