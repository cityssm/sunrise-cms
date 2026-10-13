import { backup } from 'node:sqlite';
import Debug from 'debug';
import { backupFolder, getDatabaseConnection, sunriseDB } from '../helpers/database.helpers.js';
const debug = Debug('sunrise:database:backupDatabase');
export async function backupDatabase(connectedDatabase) {
    const databasePathSplit = sunriseDB.split(/[/\\]/);
    const backupDatabasePath = `${backupFolder}/${databasePathSplit.at(-1)}.${Date.now().toString()}`;
    const database = connectedDatabase ?? getDatabaseConnection();
    try {
        const result = await backup(database, backupDatabasePath);
        if (result > 0) {
            debug('Database backup completed successfully:', backupDatabasePath);
            return backupDatabasePath;
        }
        debug('Database backup incomplete:', result, 'pages remaining');
        return false;
    }
    catch (error) {
        debug('Error backing up database:', error);
        return false;
    }
    finally {
        if (connectedDatabase === undefined) {
            database.close();
        }
    }
}
