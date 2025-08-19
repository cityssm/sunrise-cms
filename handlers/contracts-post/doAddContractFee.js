import sqlite from 'better-sqlite3';
import Debug from "debug";
import addContractFee from '../../database/addContractFee.js';
import getContractFees from '../../database/getContractFees.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { sunriseDB } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:handlers:contracts:doAddContractFee`);
export default async function handler(request, response) {
    let database;
    try {
        database = sqlite(sunriseDB);
        await addContractFee(request.body, request.session.user, database);
        const contractFees = getContractFees(request.body.contractId, database);
        response.json({
            success: true,
            contractFees
        });
    }
    catch (error) {
        debug(error);
        response.status(500).json({ errorMessage: 'Database error', success: false });
    }
    finally {
        database?.close();
    }
}
