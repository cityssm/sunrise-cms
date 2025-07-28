export interface UpdateConsignoCloudUserSettingsForm {
    thirdPartyApplicationPassword: string;
    userName: string;
}
export declare function updateConsignoCloudUserSettings(updateForm: UpdateConsignoCloudUserSettingsForm, user: User): boolean;
