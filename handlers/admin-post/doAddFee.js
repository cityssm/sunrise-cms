import sqlite from 'better-sqlite3';
import Debug from 'debug';
import addFee from '../../database/addFee.js';
import getFeeCategories from '../../database/getFeeCategories.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { sunriseDB } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:handlers:admin:doAddFee`);
export default function handler(request, response) {
    let database;
    try {
        database = sqlite(sunriseDB);
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
        debug(error);
        response
            .status(500)
            .json({ errorMessage: 'Database error', success: false });
    }
    finally {
        database?.close();
    }
}
