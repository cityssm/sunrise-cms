import getUsers from '../../database/getUsers.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { i18next } from '../../helpers/i18n.helpers.js';
export default function handler(_request, response) {
    const users = getUsers();
    // Check if there are any users defined in the config file
    const configUsers = {
        canLogin: getConfigProperty('users.canLogin'),
        canUpdate: getConfigProperty('users.canUpdate'),
        canUpdateCemeteries: getConfigProperty('users.canUpdateCemeteries'),
        canUpdateContracts: getConfigProperty('users.canUpdateContracts'),
        canUpdateWorkOrders: getConfigProperty('users.canUpdateWorkOrders'),
        isAdmin: getConfigProperty('users.isAdmin')
    };
    const hasConfigUsers = Object.values(configUsers).some((userArray) => userArray.length > 0);
    response.render('admin/users', {
        headTitle: i18next.t('admin:userManagement', {
            lng: response.locals.lng
        }),
        users,
        configUsers,
        hasConfigUsers,
        domain: getConfigProperty('login.domain')
    });
}
