import getUserSettings from '../../database/getUserSettings.js';
import { updateConsignoCloudUserSettings } from '../../database/updateConsignoCloudUserSettings.js';
export default function handler(request, response) {
    const success = updateConsignoCloudUserSettings(request.body, request.session.user);
    if (success) {
        ;
        request.session.user.userSettings = getUserSettings(request.session.user?.userName ?? '');
    }
    response.json({
        success
    });
}
