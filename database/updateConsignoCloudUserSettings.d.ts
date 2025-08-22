import sqlite from 'better-sqlite3';
export interface UpdateConsignoCloudUserSettingsForm {
    thirdPartyApplicationPassword: string;
    userName: string;
}
export declare function updateConsignoCloudUserSettings(updateForm: UpdateConsignoCloudUserSettingsForm, user: User, connectedDatabase?: sqlite.Database): boolean;
