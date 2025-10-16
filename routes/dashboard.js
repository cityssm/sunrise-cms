import { Router } from 'express';
import handler_dashboard from '../handlers/dashboard-get/dashboard.js';
import handler_exportRecordUpdateLog from '../handlers/dashboard-get/exportRecordUpdateLog.js';
import handler_updateLog from '../handlers/dashboard-get/updateLog.js';
import handler_userSettings from '../handlers/dashboard-get/userSettings.js';
import handler_doGetRecordUpdateLog from '../handlers/dashboard-post/doGetRecordUpdateLog.js';
import handler_doResetApiKey from '../handlers/dashboard-post/doResetApiKey.js';
import handler_doUpdateConsignoCloudUserSettings from '../handlers/dashboard-post/doUpdateConsignoCloudUserSettings.js';
export const router = Router();
router.get('/', handler_dashboard);
// User Settings
router
    .get('/userSettings', handler_userSettings)
    .post('/doUpdateConsignoCloudUserSettings', handler_doUpdateConsignoCloudUserSettings)
    .post('/doResetApiKey', handler_doResetApiKey);
// Update Log
router
    .get('/updateLog', handler_updateLog)
    .post('/doGetRecordUpdateLog', handler_doGetRecordUpdateLog);
router.get('/exportRecordUpdateLog', handler_exportRecordUpdateLog);
export default router;
