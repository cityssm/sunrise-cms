import sqlite from 'better-sqlite3';
import Debug from 'debug';
import { deleteRecord } from '../../database/deleteRecord.js';
import getFeeCategories from '../../database/getFeeCategories.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { sunriseDB } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:handlers:admin:doDeleteFee`);
export default function handler(request, response) {
    let database;
    try {
        database = sqlite(sunriseDB);
        const success = deleteRecord('Fees', request.body.feeId, request.session.user);
        const feeCategories = getFeeCategories({}, {
            includeFees: true
        });
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
