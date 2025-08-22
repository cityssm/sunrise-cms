import getUsers from '../../database/getUsers.js';
export default function handler(_request, response) {
    const users = getUsers();
    response.render('admin-users', {
        headTitle: 'User Management',
        users
    });
}
