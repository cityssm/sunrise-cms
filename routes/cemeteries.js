import { Router } from 'express';
import handler_edit from '../handlers/cemeteriesGet/edit.js';
import handler_new from '../handlers/cemeteriesGet/new.js';
import handler_next from '../handlers/cemeteriesGet/next.js';
import handler_previous from '../handlers/cemeteriesGet/previous.js';
import handler_search from '../handlers/cemeteriesGet/search.js';
import handler_view from '../handlers/cemeteriesGet/view.js';
import handler_doCreateCemetery from '../handlers/cemeteriesPost/doCreateCemetery.js';
import handler_doDeleteCemetery from '../handlers/cemeteriesPost/doDeleteCemetery.js';
import handler_doUpdateCemetery from '../handlers/cemeteriesPost/doUpdateCemetery.js';
import handler_doGetRecordAuditLog from '../handlers/commonPost/doGetRecordAuditLog.js';
import { updateCemeteriesGetHandler, updateCemeteriesPostHandler } from '../handlers/permissions.js';
import { getConfigProperty } from '../helpers/config.helpers.js';
export const router = Router();
router.get('/', handler_search);
router
    .get('/new', updateCemeteriesGetHandler, handler_new)
    .post('/doCreateCemetery', updateCemeteriesPostHandler, handler_doCreateCemetery);
router
    .get('/:cemeteryId', handler_view)
    .get('/:cemeteryId/next', handler_next)
    .get('/:cemeteryId/previous', handler_previous);
router
    .get('/:cemeteryId/edit', updateCemeteriesGetHandler, handler_edit)
    .post('/doUpdateCemetery', updateCemeteriesPostHandler, handler_doUpdateCemetery)
    .post('/doDeleteCemetery', updateCemeteriesPostHandler, handler_doDeleteCemetery);
if (getConfigProperty('settings.auditLog.enabled')) {
    router.post('/doGetRecordAuditLog', updateCemeteriesPostHandler, handler_doGetRecordAuditLog('cemetery'));
}
export default router;
