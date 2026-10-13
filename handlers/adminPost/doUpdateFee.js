import Debug from 'debug';
import getFeeCategories from '../../database/getFeeCategories.js';
import updateFee from '../../database/updateFee.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { getDatabaseConnection } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:handlers:admin:doUpdateFee`);
export default function handler(request, response) {
    let database;
    try {
        database = getDatabaseConnection();
        const success = updateFee(request.body, request.session.user, database);
        if (!success) {
            response
                .status(400)
                .json({ errorMessage: 'Failed to update fee', success: false });
            return;
        }
        const feeCategories = getFeeCategories({}, {
            includeFees: true
        }, database);
        response.json({
            success,
            feeCategories
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
