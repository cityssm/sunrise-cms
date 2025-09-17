import sqlite from 'better-sqlite3';
import Debug from 'debug';
import deleteWorkOrderContract from '../../database/deleteWorkOrderContract.js';
import getContracts from '../../database/getContracts.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { sunriseDB } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:handlers:workOrders:doDeleteWorkOrderContract`);
export default async function handler(request, response) {
    let database;
    try {
        database = sqlite(sunriseDB);
        const success = deleteWorkOrderContract(request.body.workOrderId, request.body.contractId, request.session.user, database);
        const workOrderContracts = await getContracts({
            workOrderId: request.body.workOrderId
        }, {
            limit: -1,
            offset: 0,
            includeFees: false,
            includeInterments: true,
            includeTransactions: false
        }, database);
        response.json({
            success,
            workOrderContracts: workOrderContracts.contracts
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
