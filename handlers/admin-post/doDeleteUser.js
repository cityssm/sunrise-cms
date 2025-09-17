import deleteUser from '../../database/deleteUser.js';
import getUsers from '../../database/getUsers.js';
export default function handler(request, response) {
    const userName = request.body.userName;
    if (!userName) {
        response.status(400).json({
            message: 'User name is required',
            success: false
        });
        return;
    }
    try {
        const success = deleteUser(userName, request.session.user);
        if (success) {
            const users = getUsers();
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
}
