import { getConfigProperty } from '../../helpers/config.helpers.js';
export function doesUserHaveConsignoCloudAccess(user) {
    return (getConfigProperty('integrations.consignoCloud.integrationIsEnabled') &&
        user !== undefined &&
        user.userProperties.canUpdateContracts &&
        (user.userSettings['consignoCloud.username'] ?? '') !== '' &&
        (user.userSettings['consignoCloud.thirdPartyApplicationPassword'] ?? '') !==
            '');
}
