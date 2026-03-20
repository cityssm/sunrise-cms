import sqlite from 'better-sqlite3';
import Debug from 'debug';
import addUser from '../../database/addUser.js';
import getUsers from '../../database/getUsers.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { sunriseDB } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:handlers:admin:doAddUser`);
export default function handler(request, response) {
    const { userName, canUpdateCemeteries = '0', canUpdateContracts = '0', canUpdateWorkOrders = '0', isAdmin = '0' } = request.body;
    let database;
    try {
        database = sqlite(sunriseDB);
        const success = addUser({
            userName,
            canUpdateCemeteries: canUpdateCemeteries === '1',
            canUpdateContracts: canUpdateContracts === '1',
            canUpdateWorkOrders: canUpdateWorkOrders === '1',
            isAdmin: isAdmin === '1'
        }, request.session.user, database);
        if (!success) {
            response
                .status(400)
                .json({ errorMessage: 'User name already exists', success: false });
            return;
        }
        const users = getUsers(database);
        response.json({
            success,
            users
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
