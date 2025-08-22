import getLocalUsers from '../../database/getLocalUsers.js';
export default function handler(_request, response) {
    const users = getLocalUsers();
    response.render('admin-users', {
        headTitle: 'User Management',
        users
    });
}
