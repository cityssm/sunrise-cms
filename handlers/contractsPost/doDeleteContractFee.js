import sqlite from 'better-sqlite3';
import Debug from 'debug';
import deleteContractFee from '../../database/deleteContractFee.js';
import getContractFees from '../../database/getContractFees.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { sunriseDB } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:handlers:contracts:doDeleteContractFee`);
export default function handler(request, response) {
    let database;
    try {
        database = sqlite(sunriseDB);
        const success = deleteContractFee(request.body.contractId, request.body.feeId, request.session.user, database);
        if (!success) {
            response
                .status(400)
                .json({ errorMessage: 'Fee not found', success: false });
            return;
        }
        const contractFees = getContractFees(request.body.contractId, database);
        response.json({
            success,
            contractFees
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
