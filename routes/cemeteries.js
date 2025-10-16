import { Router } from 'express';
import handler_edit from '../handlers/cemeteries-get/edit.js';
import handler_new from '../handlers/cemeteries-get/new.js';
import handler_next from '../handlers/cemeteries-get/next.js';
import handler_previous from '../handlers/cemeteries-get/previous.js';
import handler_search from '../handlers/cemeteries-get/search.js';
import handler_view from '../handlers/cemeteries-get/view.js';
import handler_doCreateCemetery from '../handlers/cemeteries-post/doCreateCemetery.js';
import handler_doDeleteCemetery from '../handlers/cemeteries-post/doDeleteCemetery.js';
import handler_doUpdateCemetery from '../handlers/cemeteries-post/doUpdateCemetery.js';
import { updateCemeteriesGetHandler, updateCemeteriesPostHandler } from '../handlers/permissions.js';
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
export default router;
