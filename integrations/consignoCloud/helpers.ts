import { getConfigProperty } from '../../helpers/config.helpers.js'

export function userHasConsignoCloudAccess(user?: User): boolean {
  return (
    getConfigProperty('integrations.consignoCloud.integrationIsEnabled') &&
    user !== undefined &&
    user.userProperties.canUpdate &&
    (user.userSettings['consignoCloud.userName'] ?? '') !== '' &&
    (user.userSettings['consignoCloud.thirdPartyApplicationPassword'] ?? '') !==
      ''
  )
}
