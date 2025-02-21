import { getUserNameFromApiKey } from './functions.api.js'
import { getConfigProperty } from './config.helpers.js'

export interface UserRequest {
  session?: {
    user?: User
  }
}

export interface APIRequest {
  params?: {
    apiKey?: string
  }
}

export function userIsAdmin(request: UserRequest): boolean {
  return request.session?.user?.userProperties?.isAdmin ?? false
}

export function userCanUpdate(request: UserRequest): boolean {
  return request.session?.user?.userProperties?.canUpdate ?? false
}

export async function apiKeyIsValid(request: APIRequest): Promise<boolean> {
  const apiKey = request.params?.apiKey

  if (apiKey === undefined) {
    return false
  }

  const userName = await getUserNameFromApiKey(apiKey)

  if (userName === undefined) {
    return false
  }

  return getConfigProperty('users.canLogin').some(
    (currentUserName) => userName === currentUserName.toLowerCase()
  )
}
