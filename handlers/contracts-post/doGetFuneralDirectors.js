import sqlite from 'better-sqlite3';
import Debug from 'debug';
import getFuneralDirectorsByFuneralHomeId from '../../database/getFuneralDirectorsByFuneralHomeId.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { sunriseDB } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:handlers:contracts:doGetFuneralDirectors`);
export default function handler(request, response) {
    const funeralHomeId = request.body.funeralHomeId;
    if (funeralHomeId === undefined || funeralHomeId === '') {
        response.json({
            success: false,
            errorMessage: 'Funeral Home ID is required'
        });
        return;
    }
    let database;
    try {
        database = sqlite(sunriseDB, { readonly: true });
        const funeralDirectors = getFuneralDirectorsByFuneralHomeId(funeralHomeId, database);
        response.json({
            success: true,
            funeralDirectors
        });
    }
    catch (error) {
        debug(error);
        response.status(500).json({
            success: false,
            errorMessage: 'Database error'
        });
    }
    finally {
        database?.close();
    }
}
