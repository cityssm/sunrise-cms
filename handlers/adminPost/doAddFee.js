import { debuglog } from 'node:util';
import addFee from '../../database/addFee.js';
import getFeeCategories from '../../database/getFeeCategories.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { getDatabaseConnection } from '../../helpers/database.helpers.js';
const debug = debuglog(`${DEBUG_NAMESPACE}:handlers:admin:doAddFee`);
export default function handler(request, response) {
    let database;
    try {
        database = getDatabaseConnection();
        const feeId = addFee(request.body, request.session.user, database);
        const feeCategories = getFeeCategories({}, {
            includeFees: true
        }, database);
        response.json({
            success: true,
            feeCategories,
            feeId
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
