import sqlite from 'better-sqlite3';
import deleteUser from '../../database/deleteUser.js';
import getUsers from '../../database/getUsers.js';
import { sunriseDB } from '../../helpers/database.helpers.js';
export default function handler(request, response) {
    const userName = request.body.userName?.trim() ?? '';
    if (userName === '') {
        response.status(400).json({
            message: 'User name is required',
            success: false
        });
        return;
    }
    let database;
    try {
        database = sqlite(sunriseDB);
        const success = deleteUser(userName, request.session.user, database);
        if (success) {
            const users = getUsers(database);
            response.json({
                message: 'User deleted successfully',
                success: true,
                users
            });
        }
        else {
            response.status(404).json({
                message: 'User not found',
                success: false
            });
        }
    }
    catch (error) {
        response.status(500).json({
            message: error instanceof Error ? error.message : 'Failed to delete user',
            success: false
        });
    }
    finally {
        database?.close();
    }
}
