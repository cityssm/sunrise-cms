import sqlite from 'better-sqlite3';
import Debug from 'debug';
import getContractComments from '../../database/getContractComments.js';
import updateContractComment from '../../database/updateContractComment.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { sunriseDB } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:handlers:contracts:doUpdateContractComment`);
export default function handler(request, response) {
    let database;
    try {
        database = sqlite(sunriseDB);
        const success = updateContractComment(request.body, request.session.user, database);
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
