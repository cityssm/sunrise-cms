import sqlite from 'better-sqlite3';
import Debug from 'debug';
import deleteContractTransaction from '../../database/deleteContractTransaction.js';
import getContractTransactions from '../../database/getContractTransactions.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { sunriseDB } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:handlers:contracts:doDeleteContractTransaction`);
export default async function handler(request, response) {
    let database;
    try {
        database = sqlite(sunriseDB);
        const success = deleteContractTransaction(request.body.contractId, request.body.transactionIndex, request.session.user, database);
        if (!success) {
            response
                .status(400)
                .json({ errorMessage: 'Transaction not found', success: false });
            return;
        }
        const contractTransactions = await getContractTransactions(request.body.contractId, {
            includeIntegrations: true
        }, database);
        response.json({
            success,
            contractTransactions
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
