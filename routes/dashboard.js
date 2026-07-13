import { Router } from 'express';
import handler_dashboard from '../handlers/dashboardGet/dashboard.js';
import handler_updateLog from '../handlers/dashboardGet/updateLog.js';
import handler_userSettings from '../handlers/dashboardGet/userSettings.js';
import handler_doGetRecordUpdateLog from '../handlers/dashboardPost/doGetRecordUpdateLog.js';
import handler_doResetApiKey from '../handlers/dashboardPost/doResetApiKey.js';
import handler_doUpdateConsignoCloudUserSettings from '../handlers/dashboardPost/doUpdateConsignoCloudUserSettings.js';
export const router = Router();
router.get('/', handler_dashboard);
router
    .get('/userSettings', handler_userSettings)
    .post('/doUpdateConsignoCloudUserSettings', handler_doUpdateConsignoCloudUserSettings)
    .post('/doResetApiKey', handler_doResetApiKey);
router
    .get('/updateLog', handler_updateLog)
    .post('/doGetRecordUpdateLog', handler_doGetRecordUpdateLog);
export default router;
