import sqlite from 'better-sqlite3';
import Debug from 'debug';
import getUserSettings from '../../database/getUserSettings.js';
import { updateApiKeyUserSetting } from '../../database/updateUserSetting.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { sunriseDB } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:handlers:dashboard:doResetApiKey`);
export default function handler(request, response) {
    let database;
    try {
        database = sqlite(sunriseDB);
        const apiKey = updateApiKeyUserSetting(request.session.user?.userName ?? '');
        request.session.user.userSettings = getUserSettings(request.session.user?.userName ?? '');
        response.json({
            success: true,
            apiKey
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
