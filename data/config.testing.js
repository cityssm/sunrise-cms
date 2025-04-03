import { config as cemeteryConfig } from './config.baseSsm.js';
export const config = { ...cemeteryConfig };
config.application.useTestDatabases = true;
config.session.doKeepAlive = true;
config.users = {
    testing: ['*testView', '*testUpdate', '*testAdmin'],
    canLogin: ['*testView', '*testUpdate', '*testAdmin'],
    canUpdate: ['*testUpdate'],
    isAdmin: ['*testAdmin']
};
config.settings.publicInternalPath = 'public-internal';
config.settings.dynamicsGP.integrationIsEnabled = false;
export default config;
