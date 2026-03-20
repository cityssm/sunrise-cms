import sqlite from 'better-sqlite3';
import Debug from 'debug';
import deleteContractInterment from '../../database/deleteContractInterment.js';
import getContractInterments from '../../database/getContractInterments.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { sunriseDB } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:handlers:contracts:doDeleteContractInterment`);
export default function handler(request, response) {
    let database;
    try {
        database = sqlite(sunriseDB);
        const success = deleteContractInterment(request.body.contractId, request.body.intermentNumber, request.session.user, database);
        if (!success) {
            response
                .status(400)
                .json({ errorMessage: 'Interment not found', success: false });
            return;
        }
        const contractInterments = getContractInterments(request.body.contractId, database);
        response.json({
            success,
            contractInterments
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
