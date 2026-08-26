import { getConfigProperty } from '../../helpers/config.helpers.js'

export function userHasConsignoCloudAccess(user?: User): boolean {
  return (
    getConfigProperty('integrations.consignoCloud.integrationIsEnabled') &&
    user !== undefined &&
    user.userProperties.canUpdateContracts &&
    (user.userSettings['consignoCloud.username'] ?? '') !== '' &&
    (user.userSettings['consignoCloud.thirdPartyApplicationPassword'] ?? '') !==
      ''
  )
}
