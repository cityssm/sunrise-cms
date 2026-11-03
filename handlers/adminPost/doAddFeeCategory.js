import { debuglog } from 'node:util';
import addFeeCategory from '../../database/addFeeCategory.js';
import getFeeCategories from '../../database/getFeeCategories.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { getDatabaseConnection } from '../../helpers/database.helpers.js';
const debug = debuglog(`${DEBUG_NAMESPACE}:handlers:admin:doAddFeeCategory`);
export default function handler(request, response) {
    let database;
    try {
        database = getDatabaseConnection();
        const feeCategoryId = addFeeCategory(request.body, request.session.user, database);
        const feeCategories = getFeeCategories({}, {
            includeFees: true
        }, database);
        response.json({
            success: true,
            feeCategories,
            feeCategoryId
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
