import { debuglog } from 'node:util';
import deleteContractFee from '../../database/deleteContractFee.js';
import getContractFees from '../../database/getContractFees.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { getDatabaseConnection } from '../../helpers/database.helpers.js';
const debug = debuglog(`${DEBUG_NAMESPACE}:handlers:contracts:doDeleteContractFee`);
export default function handler(request, response) {
    let database;
    try {
        database = getDatabaseConnection();
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
        debug(JSON.stringify(error, undefined, 2));
        response
            .status(500)
            .json({ errorMessage: 'Database error', success: false });
    }
    finally {
        database?.close();
    }
}
