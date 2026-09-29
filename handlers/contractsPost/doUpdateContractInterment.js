import { DatabaseSync } from 'node:sqlite';
import Debug from 'debug';
import getContractInterments from '../../database/getContractInterments.js';
import updateContractInterment from '../../database/updateContractInterment.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { sunriseDB } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:handlers:contracts:doUpdateContractInterment`);
export default function handler(request, response) {
    let database;
    try {
        database = new DatabaseSync(sunriseDB);
        updateContractInterment(request.body, request.session.user, database);
        const contractInterments = getContractInterments(request.body.contractId, database);
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
