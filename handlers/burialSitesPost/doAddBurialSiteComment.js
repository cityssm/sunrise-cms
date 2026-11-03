import { debuglog } from 'node:util';
import addBurialSiteComment from '../../database/addBurialSiteComment.js';
import getBurialSiteComments from '../../database/getBurialSiteComments.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { getDatabaseConnection } from '../../helpers/database.helpers.js';
const debug = debuglog(`${DEBUG_NAMESPACE}:handlers:burialSites:doAddBurialSiteComment`);
export default function handler(request, response) {
    let database;
    try {
        database = getDatabaseConnection();
        addBurialSiteComment(request.body, request.session.user, database);
        const burialSiteComments = getBurialSiteComments(request.body.burialSiteId, database);
        response.json({
            success: true,
            burialSiteComments
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
