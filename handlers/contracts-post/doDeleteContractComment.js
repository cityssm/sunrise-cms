import sqlite from 'better-sqlite3';
import Debug from 'debug';
import { deleteRecord } from '../../database/deleteRecord.js';
import getContractComments from '../../database/getContractComments.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { sunriseDB } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:handlers:contracts:doDeleteContractComment`);
export default function handler(request, response) {
    let database;
    try {
        database = sqlite(sunriseDB);
        const success = deleteRecord('ContractComments', request.body.contractCommentId, request.session.user, database);
        if (!success) {
            response
                .status(400)
                .json({ errorMessage: 'Comment not found', success: false });
            return;
        }
        const contractComments = getContractComments(request.body.contractId, database);
        response.json({
            success,
            contractComments
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
