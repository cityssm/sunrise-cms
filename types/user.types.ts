declare global {
  type User = {
    username: string
    userProperties: UserProperties
    userSettings: Partial<Record<UserSettingKey, string>>
  }
}

export type UserSettingKey =
  | 'apiKey'
  | 'consignoCloud.thirdPartyApplicationPassword'
  | 'consignoCloud.username'

export type UserProperties = {
  canUpdateCemeteries: boolean
  canUpdateContracts: boolean
  canUpdateWorkOrders: boolean

  isAdmin: boolean
}

declare module 'express-session' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- using interface to extend express-session's Session
  interface Session {
    user?: User
  }
}
