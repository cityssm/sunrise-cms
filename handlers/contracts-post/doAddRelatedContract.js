import sqlite from 'better-sqlite3';
import Debug from 'debug';
import addRelatedContract from '../../database/addRelatedContract.js';
import getContracts from '../../database/getContracts.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { sunriseDB } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:handlers:contracts:doAddRelatedContract`);
export default async function handler(request, response) {
    let database;
    try {
        database = sqlite(sunriseDB);
        addRelatedContract(request.body, database);
        const relatedContracts = await getContracts({
            relatedContractId: request.body.contractId
        }, {
            limit: -1,
            offset: 0,
            includeFees: false,
            includeInterments: true,
            includeTransactions: false
        }, database);
        response.json({
            success: true,
            relatedContracts: relatedContracts.contracts
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
