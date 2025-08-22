import addLocalUser from '../../database/addLocalUser.js';
export default function handler(request, response) {
    const user = request.session?.user;
    if (!user) {
        response.status(403).json({ success: false, message: 'Unauthorized' });
        return;
    }
    const { userName, displayName, password, canUpdateCemeteries = '0', canUpdateContracts = '0', canUpdateWorkOrders = '0', isAdmin = '0' } = request.body;
    if (!userName || !password) {
        response.status(400).json({
            success: false,
            message: 'Username and password are required'
        });
        return;
    }
    try {
        const userId = addLocalUser({
            userName,
            displayName,
            password,
            canUpdateCemeteries: canUpdateCemeteries === '1',
            canUpdateContracts: canUpdateContracts === '1',
            canUpdateWorkOrders: canUpdateWorkOrders === '1',
            isAdmin: isAdmin === '1'
        }, user);
        response.json({
            success: true,
            message: 'User created successfully',
            userId
        });
    }
    catch (error) {
        response.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to create user'
        });
    }
}
