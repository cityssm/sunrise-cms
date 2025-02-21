import Debug from 'debug';
import { DEBUG_NAMESPACE } from '../debug.config.js';
import { getConfigProperty } from './config.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:database.helpers`);
export const useTestDatabases = getConfigProperty('application.useTestDatabases') ||
    process.env.TEST_DATABASES === 'true';
if (useTestDatabases) {
    debug('Using "-testing" databases.');
}
export const sunriseDBLive = 'data/sunrise.db';
export const sunriseDBTesting = 'data/sunrise-testing.db';
export const sunriseDB = useTestDatabases ? sunriseDBTesting : sunriseDBLive;
export const backupFolder = 'data/backups';
