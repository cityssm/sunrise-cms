import { debuglog } from 'node:util';
import getUserSettings from '../../database/getUserSettings.js';
import { updateConsignoCloudUserSettings } from '../../database/updateConsignoCloudUserSettings.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { getDatabaseConnection } from '../../helpers/database.helpers.js';
const debug = debuglog(`${DEBUG_NAMESPACE}:handlers:dashboard:doUpdateConsignoCloudUserSettings`);
export default function handler(request, response) {
    let database;
    try {
        database = getDatabaseConnection();
        const success = updateConsignoCloudUserSettings(request.body, request.session.user, database);
        if (!success) {
            response
                .status(400)
                .json({ errorMessage: 'Failed to update settings', success: false });
            return;
        }
        ;
        request.session.user.userSettings = getUserSettings(request.session.user?.username ?? '', database);
        response.json({
            success
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
