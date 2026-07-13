import updateSetting from '../../database/updateSetting.js';
export default function handler(request, response) {
    const success = updateSetting(request.body);
    response.json({
        success
    });
}
