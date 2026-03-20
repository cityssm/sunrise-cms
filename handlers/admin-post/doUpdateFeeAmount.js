import sqlite from 'better-sqlite3';
import Debug from 'debug';
import getFeeCategories from '../../database/getFeeCategories.js';
import { updateFeeAmount } from '../../database/updateFee.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { sunriseDB } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:handlers:admin:doUpdateFeeAmount`);
export default function handler(request, response) {
    let database;
    try {
        database = sqlite(sunriseDB);
        const success = updateFeeAmount(request.body, request.session.user, database);
        if (!success) {
            response
                .status(400)
                .json({ errorMessage: 'Failed to update fee amount', success: false });
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
