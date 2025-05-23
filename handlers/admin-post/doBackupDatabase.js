import { backupDatabase } from '../../database/backupDatabase.js';
export default async function handler(_request, response) {
    const backupDatabasePath = await backupDatabase();
    if (typeof backupDatabasePath === 'string') {
        const backupDatabasePathSplit = backupDatabasePath.split(/[/\\]/);
        const fileName = backupDatabasePathSplit.at(-1);
        response.json({
            success: true,
            fileName
        });
    }
    else {
        response.json({
            success: false,
            errorMessage: 'Unable to write backup file.'
        });
    }
}
