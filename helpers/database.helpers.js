import fs from 'node:fs/promises';
import path from 'node:path';
import Debug from 'debug';
import { DEBUG_NAMESPACE, PROCESS_ID_MAX_DIGITS } from '../debug.config.js';
import { getConfigProperty } from './config.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:helpers:database:${process.pid.toString().padEnd(PROCESS_ID_MAX_DIGITS)}`);
export const useTestDatabases = getConfigProperty('application.useTestDatabases') ||
    process.env.TEST_DATABASES === 'true';
if (useTestDatabases) {
    debug('Using "-testing" databases.');
}
export const sunriseDBLive = 'data/sunrise.db';
export const sunriseDBTesting = 'data/sunrise-testing.db';
export const sunriseDB = useTestDatabases ? sunriseDBTesting : sunriseDBLive;
export const backupFolder = 'data/backups';
const LIMIT_DEFAULT = 50;
export function sanitizeLimit(limit) {
    const limitNumber = Number(limit);
    if (Number.isNaN(limitNumber) || limitNumber < 0) {
        return LIMIT_DEFAULT;
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
    let lastBackupDate;
    try {
        const filesInBackup = await fs.readdir(backupFolder);
        const statPromises = filesInBackup
            .filter((file) => file.includes('.db.'))
            .map(async (file) => {
            const filePath = path.join(backupFolder, file);
            return await fs.stat(filePath);
        });
        const stats = await Promise.all(statPromises);
        for (const stat of stats) {
            if (lastBackupDate === undefined ||
                stat.mtime.getTime() > lastBackupDate.getTime()) {
                lastBackupDate = stat.mtime;
            }
        }
    }
    catch (error) {
        debug('Error getting last backup date:', error);
    }
    return lastBackupDate;
}
