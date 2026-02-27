import sqlite from 'better-sqlite3';
import Debug from 'debug';
import getFeeCategories from '../../database/getFeeCategories.js';
import updateFeeCategory from '../../database/updateFeeCategory.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { sunriseDB } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:handlers:admin:doUpdateFeeCategory`);
export default function handler(request, response) {
    let database;
    try {
        database = sqlite(sunriseDB);
        const success = updateFeeCategory(request.body, request.session.user, database);
        const feeCategories = getFeeCategories({}, {
            includeFees: true
        }, database);
        response.json({
            success,
            feeCategories,
            errorMessage: success ? '' : 'Failed to update fee category'
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
