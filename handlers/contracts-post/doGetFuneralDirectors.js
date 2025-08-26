import sqlite from 'better-sqlite3';
import Debug from 'debug';
import getFuneralDirectorNamesByFuneralHomeId from '../../database/getFuneralDirectorNamesByFuneralHomeId.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { sunriseDB } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:handlers:contracts:doGetFuneralDirectors`);
export default function handler(request, response) {
    const funeralHomeId = request.body.funeralHomeId;
    let database;
    try {
        database = sqlite(sunriseDB, { readonly: true });
        const funeralDirectorNames = getFuneralDirectorNamesByFuneralHomeId(funeralHomeId, database);
        response.json({
            success: true,
            funeralDirectorNames
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
