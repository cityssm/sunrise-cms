import { debuglog } from 'node:util';
import addContractFeeCategory from '../../database/addContractFeeCategory.js';
import getContractFees from '../../database/getContractFees.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { getDatabaseConnection } from '../../helpers/database.helpers.js';
const debug = debuglog(`${DEBUG_NAMESPACE}:handlers:contracts:doAddContractFeeCategory`);
export default async function handler(request, response) {
    let database;
    try {
        database = getDatabaseConnection();
        await addContractFeeCategory(request.body, request.session.user, database);
        const contractFees = getContractFees(request.body.contractId, database);
        response.json({
            success: true,
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
