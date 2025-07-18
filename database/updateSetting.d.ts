export interface UpdateSettingForm {
    settingKey: string;
    settingValue: string;
}
export default function updateSetting(updateForm: UpdateSettingForm): boolean;
