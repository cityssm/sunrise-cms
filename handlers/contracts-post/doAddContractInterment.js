import sqlite from 'better-sqlite3';
import Debug from 'debug';
import addContractInterment from '../../database/addContractInterment.js';
import getContractInterments from '../../database/getContractInterments.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { sunriseDB } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:handlers:admin:doAddContractInterment`);
export default function handler(request, response) {
    let database;
    try {
        database = sqlite(sunriseDB);
        addContractInterment(request.body, request.session.user);
        const contractInterments = getContractInterments(request.body.contractId);
        response.json({
            success: true,
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
