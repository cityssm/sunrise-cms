declare global {
  export interface User {
    username: string
    userProperties: UserProperties
    userSettings: Partial<Record<UserSettingKey, string>>
  }
}

export type UserSettingKey =
  | 'apiKey'
  | 'consignoCloud.thirdPartyApplicationPassword'
  | 'consignoCloud.username'

export interface UserProperties {
  canUpdateCemeteries: boolean
  canUpdateContracts: boolean
  canUpdateWorkOrders: boolean

  isAdmin: boolean
}

declare module 'express-session' {
  interface Session {
    user?: User
  }
}
