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
config.users = {
    canLogin: ['*testView', '*testUpdate', '*testAdmin'],
    canUpdate: ['*testUpdate'],
    isAdmin: ['*testAdmin'],
    testing: ['*testView', '*testUpdate', '*testAdmin']
};
config.integrations.dynamicsGP.integrationIsEnabled = false;
export default config;
