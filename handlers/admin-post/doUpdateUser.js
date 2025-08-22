import updateLocalUser from '../../database/updateLocalUser.js';
export default function handler(request, response) {
    const user = request.session?.user;
    if (!user) {
        response.status(403).json({ success: false, message: 'Unauthorized' });
        return;
    }
    const { userId, displayName, password, canUpdateCemeteries = '0', canUpdateContracts = '0', canUpdateWorkOrders = '0', isAdmin = '0', isActive = '0' } = request.body;
    if (!userId) {
        response.status(400).json({
            success: false,
            message: 'User ID is required'
        });
        return;
    }
    try {
        const success = updateLocalUser(parseInt(userId, 10), {
            userName: '', // userName is not updated through this endpoint
            displayName,
            password: password || undefined,
            canUpdateCemeteries: canUpdateCemeteries === '1',
            canUpdateContracts: canUpdateContracts === '1',
            canUpdateWorkOrders: canUpdateWorkOrders === '1',
            isAdmin: isAdmin === '1',
            isActive: isActive === '1'
        }, user);
        if (success) {
            response.json({
                success: true,
                message: 'User updated successfully'
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
            message: error instanceof Error ? error.message : 'Failed to update user'
        });
    }
}
