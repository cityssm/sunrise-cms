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

  const userName = getUserNameFromApiKey(apiKey)

  if (userName === undefined) {
    return false
  }

  return getConfigProperty('users.canLogin').some(
    (currentUserName) => userName === currentUserName.toLowerCase()
  )
}

export function userCanUpdate(request: UserRequest): boolean {
  return request.session?.user?.userProperties.canUpdate ?? false
}

export function userCanUpdateWorkOrders(request: UserRequest): boolean {
  return request.session?.user?.userProperties.canUpdateWorkOrders ?? false
}

export function userIsAdmin(request: UserRequest): boolean {
  return request.session?.user?.userProperties.isAdmin ?? false
}
