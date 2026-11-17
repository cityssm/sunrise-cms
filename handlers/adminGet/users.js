import getUsers from '../../database/getUsers.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { i18next } from '../../helpers/i18n.helpers.js';
export default function handler(_request, response) {
    const users = getUsers();
    const configUsers = {
        canLogin: getConfigProperty('users.canLogin'),
        canUpdate: getConfigProperty('users.canUpdate'),
        canUpdateCemeteries: getConfigProperty('users.canUpdateCemeteries'),
        canUpdateContracts: getConfigProperty('users.canUpdateContracts'),
        canUpdateWorkOrders: getConfigProperty('users.canUpdateWorkOrders'),
        isAdmin: getConfigProperty('users.isAdmin')
    };
    const configUserNames = [
        ...new Set([
            ...configUsers.canLogin,
            ...configUsers.canUpdate,
            ...configUsers.canUpdateCemeteries,
            ...configUsers.canUpdateContracts,
            ...configUsers.canUpdateWorkOrders,
            ...configUsers.isAdmin
        ].map((username) => username.toLowerCase()))
    ].toSorted((left, right) => left.localeCompare(right));
    const hasConfigUsers = configUserNames.length > 0;
    response.render('admin/users', {
        headTitle: i18next.t('admin:userManagement', {
            lng: response.locals.lng
        }),
        users,
        configUserNames,
        configUsers,
        hasConfigUsers,
        domain: getConfigProperty('login.domain')
    });
}
