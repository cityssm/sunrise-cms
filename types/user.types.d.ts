declare global {
    export interface User {
        userName: string;
        userProperties: UserProperties;
        userSettings: Partial<Record<UserSettingKey, string>>;
    }
}
export type UserSettingKey = 'apiKey' | 'consignoCloud.thirdPartyApplicationPassword' | 'consignoCloud.userName';
export interface UserProperties {
    canUpdate: boolean;
    canUpdateWorkOrders: boolean;
    isAdmin: boolean;
}
declare module 'express-session' {
    interface Session {
        user?: User;
    }
}
