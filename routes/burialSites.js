import { Router } from 'express';
import handler_creator from '../handlers/burialSites-get/creator.js';
import handler_edit from '../handlers/burialSites-get/edit.js';
import handler_gpsCapture from '../handlers/burialSites-get/gpsCapture.js';
import handler_map from '../handlers/burialSites-get/map.js';
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
import handler_doGetBurialSitesForMap from '../handlers/burialSites-post/doGetBurialSitesForMap.js';
import handler_doGetBurialSiteTypeFields from '../handlers/burialSites-post/doGetBurialSiteTypeFields.js';
import handler_doRestoreBurialSite from '../handlers/burialSites-post/doRestoreBurialSite.js';
import handler_doSearchBurialSites from '../handlers/burialSites-post/doSearchBurialSites.js';
import handler_doSearchBurialSitesForGps from '../handlers/burialSites-post/doSearchBurialSitesForGps.js';
import handler_doUpdateBurialSite from '../handlers/burialSites-post/doUpdateBurialSite.js';
import handler_doUpdateBurialSiteComment from '../handlers/burialSites-post/doUpdateBurialSiteComment.js';
import handler_doUpdateBurialSiteLatitudeLongitude from '../handlers/burialSites-post/doUpdateBurialSiteLatitudeLongitude.js';
import { adminPostHandler, updateCemeteriesGetHandler, updateCemeteriesPostHandler } from '../handlers/permissions.js';
export const router = Router();
/*
 * Burial Site Search
 */
router
    .get('/', handler_search)
    .post('/doSearchBurialSites', handler_doSearchBurialSites);
/*
 * GPS Coordinate Capture
 */
router
    .get('/gpsCapture', updateCemeteriesGetHandler, handler_gpsCapture)
    .post('/doSearchBurialSitesForGPS', updateCemeteriesPostHandler, handler_doSearchBurialSitesForGps)
    .post('/doUpdateBurialSiteLatitudeLongitude', updateCemeteriesPostHandler, handler_doUpdateBurialSiteLatitudeLongitude);
/*
 * Burial Site Map
 */
router
    .get('/map', handler_map)
    .post('/doGetBurialSitesForMap', handler_doGetBurialSitesForMap);
/*
 * Burial Site Creator
 */
router
    .get('/creator', updateCemeteriesGetHandler, handler_creator)
    .post('/doGetBurialSiteNamesByRange', updateCemeteriesPostHandler, handler_doGetBurialSiteNamesByRange);
/*
 * Burial Site View / Edit
 */
router.get('/new', updateCemeteriesGetHandler, handler_new);
router
    .get('/:burialSiteId', handler_view)
    .get('/:burialSiteId/next', handler_next)
    .get('/:burialSiteId/previous', handler_previous);
router
    .get('/:burialSiteId/edit', updateCemeteriesGetHandler, handler_edit)
    .post('/doGetBurialSiteTypeFields', updateCemeteriesPostHandler, handler_doGetBurialSiteTypeFields)
    .post('/doCreateBurialSite', updateCemeteriesPostHandler, handler_doCreateBurialSite)
    .post('/doUpdateBurialSite', updateCemeteriesPostHandler, handler_doUpdateBurialSite)
    .post('/doDeleteBurialSite', updateCemeteriesPostHandler, handler_doDeleteBurialSite)
    .post('/doRestoreBurialSite', adminPostHandler, handler_doRestoreBurialSite);
/*
 * Burial Site Comments
 */
router
    .post('/doAddBurialSiteComment', updateCemeteriesPostHandler, handler_doAddBurialSiteComment)
    .post('/doUpdateBurialSiteComment', updateCemeteriesPostHandler, handler_doUpdateBurialSiteComment)
    .post('/doDeleteBurialSiteComment', updateCemeteriesPostHandler, handler_doDeleteBurialSiteComment);
export default router;
