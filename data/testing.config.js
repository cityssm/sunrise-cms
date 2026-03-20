import { config as cemeteryConfig } from './partialConfigs/ontario.partialConfig.js';
export const config = { ...cemeteryConfig };
config.application.useTestDatabases = true;
config.login = {
    authentication: {
        config: {
            authenticate: (userName, password) => {
                if (userName === '' || password === '') {
                    return false;
                }
                return ((config.application.useTestDatabases ?? false) &&
                    `${config.login?.domain}\\${userName}` === password);
            }
        },
        type: 'function'
    },
    domain: ''
};
config.session.doKeepAlive = true;
const testViewUser = '*testView';
const testUpdateUser = '*testUpdate';
const testAdminUser = '*testAdmin';
config.users = {
    canLogin: [testViewUser, testUpdateUser, testAdminUser],
    canUpdate: [testUpdateUser],
    isAdmin: [testAdminUser],
    testing: [testViewUser, testUpdateUser, testAdminUser]
};
config.settings.burialSites.burialSiteNameSegments = {
    includeCemeteryKey: true,
    separator: '-',
    segments: {
        1: {
            isAvailable: true,
            isRequired: false,
            label: 'Range',
            maxLength: 4,
            minLength: 1
        },
        2: {
            isAvailable: true,
            isRequired: false,
            label: 'Lot',
            maxLength: 4,
            minLength: 1
        },
        3: {
            isAvailable: true,
            isRequired: true,
            label: 'Grave',
            maxLength: 4,
            minLength: 1
        }
    }
};
config.settings.auditLog.enabled = true;
export default config;
