import getUserSettings from '../database/getUserSettings.js'

import { getUserNameFromApiKey } from './cache/apiKeys.cache.js'
import { getConfigProperty } from './config.helpers.js'

export interface APIRequest {
  params?: {
    apiKey?: string
  }
}

export interface UserRequest {
  session?: {
    user?: User
  }
}

export function apiKeyIsValid(request: APIRequest): boolean {
  const apiKey = request.params?.apiKey

  // eslint-disable-next-line security/detect-possible-timing-attacks
  if (apiKey === undefined) {
    return false
  }

  const userName = getUserNameFromApiKey(apiKey)?.toLowerCase()

  if (userName === undefined) {
    return false
  }

  return getConfigProperty('users.canLogin').some(
    (currentUserName) => userName === currentUserName.toLowerCase()
  )
}

export function userCanUpdateCemeteries(request: UserRequest): boolean {
  return request.session?.user?.userProperties.canUpdateCemeteries ?? false
}

export function userCanUpdateContracts(request: UserRequest): boolean {
  return request.session?.user?.userProperties.canUpdateContracts ?? false
}

export function userCanUpdateWorkOrders(request: UserRequest): boolean {
  return request.session?.user?.userProperties.canUpdateWorkOrders ?? false
}

export function userIsAdmin(request: UserRequest): boolean {
  return request.session?.user?.userProperties.isAdmin ?? false
}

export function getUser(userName: string): User | undefined {
  const userNameLowerCase = userName.toLowerCase()

  const canLogin = getConfigProperty('users.canLogin').some(
    (currentUserName) => userNameLowerCase === currentUserName.toLowerCase()
  )

  if (canLogin) {
    const canUpdateAll = getConfigProperty('users.canUpdate').some(
      (currentUserName) => userNameLowerCase === currentUserName.toLowerCase()
    )

    const canUpdateCemeteries =
      canUpdateAll ||
      getConfigProperty('users.canUpdateCemeteries').some(
        (currentUserName) => userNameLowerCase === currentUserName.toLowerCase()
      )

    const canUpdateContracts =
      canUpdateAll ||
      getConfigProperty('users.canUpdateContracts').some(
        (currentUserName) => userNameLowerCase === currentUserName.toLowerCase()
      )

    const canUpdateWorkOrders =
      canUpdateAll ||
      getConfigProperty('users.canUpdateWorkOrders').some(
        (currentUserName) => userNameLowerCase === currentUserName.toLowerCase()
      )

    const isAdmin = getConfigProperty('users.isAdmin').some(
      (currentUserName) => userNameLowerCase === currentUserName.toLowerCase()
    )

    const userSettings = getUserSettings(userName)

    return {
      userName: userNameLowerCase,
      userProperties: {
        canUpdateCemeteries,
        canUpdateContracts,
        canUpdateWorkOrders,
        isAdmin
      },
      userSettings
    } satisfies User
  }

  return undefined
}
