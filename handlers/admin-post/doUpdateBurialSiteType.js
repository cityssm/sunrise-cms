import sqlite from 'better-sqlite3';
import Debug from 'debug';
import updateBurialSiteType from '../../database/updateBurialSiteType.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js';
import { sunriseDB } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:handlers:admin:doUpdateBurialSiteType`);
export default function handler(request, response) {
    let database;
    try {
        database = sqlite(sunriseDB);
        const success = updateBurialSiteType(request.body, request.session.user, database);
        const burialSiteTypes = getCachedBurialSiteTypes();
        response.json({
            success,
            burialSiteTypes
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
