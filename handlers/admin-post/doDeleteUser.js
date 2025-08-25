import deleteUser from '../../database/deleteUser.js';
import getUsers from '../../database/getUsers.js';
export default function handler(request, response) {
    const { userName } = request.body;
    if (!userName) {
        response.status(400).json({
            success: false,
            message: 'User name is required'
        });
        return;
    }
    try {
        const success = deleteUser(userName, request.session.user);
        if (success) {
            const users = getUsers();
            response.json({
                success: true,
                message: 'User deleted successfully',
                users
            });
        }
        else {
            response.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
    }
    catch (error) {
        response.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to delete user'
        });
    }
}
