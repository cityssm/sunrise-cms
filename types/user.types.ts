declare global {
  export interface User {
    userName: string
    userProperties?: UserProperties
  }
}

export interface UserProperties {
  apiKey: string
  canUpdate: boolean
  canUpdateWorkOrders: boolean
  isAdmin: boolean
}

declare module 'express-session' {
  interface Session {
    user?: User
  }
}
