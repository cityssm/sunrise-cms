import { Router } from 'express';
import handler_dashboard from '../handlers/dashboard-get/dashboard.js';
import handler_userSettings from '../handlers/dashboard-get/userSettings.js';
import handler_doUpdateConsignoCloudUserSettings from '../handlers/dashboard-post/doUpdateConsignoCloudUserSettings.js';
export const router = Router();
router.get('/', handler_dashboard);
// User Settings
router.get('/userSettings', handler_userSettings);
router.post('/doUpdateConsignoCloudUserSettings', handler_doUpdateConsignoCloudUserSettings);
export default router;
