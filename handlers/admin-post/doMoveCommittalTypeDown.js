import sqlite from 'better-sqlite3';
import Debug from 'debug';
import { moveRecordDown, moveRecordDownToBottom } from '../../database/moveRecord.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { getCachedCommittalTypes } from '../../helpers/cache/committalTypes.cache.js';
import { sunriseDB } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:handlers:admin:doMoveCommittalTypeDown`);
export default function handler(request, response) {
    let database;
    try {
        database = sqlite(sunriseDB);
        const success = request.body.moveToEnd === '1'
            ? moveRecordDownToBottom('CommittalTypes', request.body.committalTypeId, database)
            : moveRecordDown('CommittalTypes', request.body.committalTypeId, database);
        const committalTypes = getCachedCommittalTypes();
        response.json({
            success,
            committalTypes
        });
    }
    catch (error) {
        debug(error);
        response
            .status(500)
            .json({ errorMessage: 'Database error', success: false });
    }
    finally {
        database?.close();
    }
}
