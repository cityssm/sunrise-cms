import sqlite from 'better-sqlite3';
import Debug from 'debug';
import addBurialSiteComment from '../../database/addBurialSiteComment.js';
import getBurialSiteComments from '../../database/getBurialSiteComments.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { sunriseDB } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:handlers:burialSites:doAddBurialSiteComment`);
export default function handler(request, response) {
    let database;
    try {
        database = sqlite(sunriseDB);
        addBurialSiteComment(request.body, request.session.user);
        const burialSiteComments = getBurialSiteComments(request.body.burialSiteId);
        response.json({
            success: true,
            burialSiteComments
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
