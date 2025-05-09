import { Router } from 'express';
import handler_creator from '../handlers/burialSites-get/creator.js';
import handler_edit from '../handlers/burialSites-get/edit.js';
import handler_new from '../handlers/burialSites-get/new.js';
import handler_next from '../handlers/burialSites-get/next.js';
import handler_previous from '../handlers/burialSites-get/previous.js';
import handler_search from '../handlers/burialSites-get/search.js';
import handler_view from '../handlers/burialSites-get/view.js';
import handler_doAddBurialSiteComment from '../handlers/burialSites-post/doAddBurialSiteComment.js';
import handler_doCreateBurialSite from '../handlers/burialSites-post/doCreateBurialSite.js';
import handler_doDeleteBurialSite from '../handlers/burialSites-post/doDeleteBurialSite.js';
import handler_doDeleteBurialSiteComment from '../handlers/burialSites-post/doDeleteBurialSiteComment.js';
import handler_doGetBurialSiteNamesByRange from '../handlers/burialSites-post/doGetBurialSiteNamesByRange.js';
import handler_doGetBurialSiteTypeFields from '../handlers/burialSites-post/doGetBurialSiteTypeFields.js';
import handler_doRestoreBurialSite from '../handlers/burialSites-post/doRestoreBurialSite.js';
import handler_doSearchBurialSites from '../handlers/burialSites-post/doSearchBurialSites.js';
import handler_doUpdateBurialSite from '../handlers/burialSites-post/doUpdateBurialSite.js';
import handler_doUpdateBurialSiteComment from '../handlers/burialSites-post/doUpdateBurialSiteComment.js';
import { adminPostHandler, updateGetHandler, updatePostHandler } from '../handlers/permissions.js';
export const router = Router();
/*
 * Burial Site Search
 */
router.get('/', handler_search);
router.post('/doSearchBurialSites', handler_doSearchBurialSites);
/*
 * Burial Site Creator
 */
router.get('/creator', updateGetHandler, handler_creator);
router.post('/doGetBurialSiteNamesByRange', updatePostHandler, handler_doGetBurialSiteNamesByRange);
/*
 * Burial Site View / Edit
 */
router.get('/new', updateGetHandler, handler_new);
router.get('/:burialSiteId', handler_view);
router.get('/:burialSiteId/next', handler_next);
router.get('/:burialSiteId/previous', handler_previous);
router.get('/:burialSiteId/edit', updateGetHandler, handler_edit);
router.post('/doGetBurialSiteTypeFields', updatePostHandler, handler_doGetBurialSiteTypeFields);
router.post('/doCreateBurialSite', updatePostHandler, handler_doCreateBurialSite);
router.post('/doUpdateBurialSite', updatePostHandler, handler_doUpdateBurialSite);
router.post('/doDeleteBurialSite', updatePostHandler, handler_doDeleteBurialSite);
router.post('/doRestoreBurialSite', adminPostHandler, handler_doRestoreBurialSite);
/*
 * Burial Site Comments
 */
router.post('/doAddBurialSiteComment', updatePostHandler, handler_doAddBurialSiteComment);
router.post('/doUpdateBurialSiteComment', updatePostHandler, handler_doUpdateBurialSiteComment);
router.post('/doDeleteBurialSiteComment', updatePostHandler, handler_doDeleteBurialSiteComment);
export default router;
