import { config as cemeteryConfig } from './ssm.ontario.config.js';
export const config = { ...cemeteryConfig };
config.application.useTestDatabases = true;
config.session.doKeepAlive = true;
config.users = {
    canLogin: ['*testView', '*testUpdate', '*testAdmin'],
    canUpdate: ['*testUpdate'],
    isAdmin: ['*testAdmin'],
    testing: ['*testView', '*testUpdate', '*testAdmin']
};
config.settings.publicInternalPath = 'public-internal';
config.settings.dynamicsGP.integrationIsEnabled = false;
export default config;
