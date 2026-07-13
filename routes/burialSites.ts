import { Router } from 'express'

import handler_creator from '../handlers/burialSitesGet/creator.js'
import handler_edit from '../handlers/burialSitesGet/edit.js'
import handler_gpsCapture from '../handlers/burialSitesGet/gpsCapture.js'
import handler_map from '../handlers/burialSitesGet/map.js'
import handler_new from '../handlers/burialSitesGet/new.js'
import handler_next from '../handlers/burialSitesGet/next.js'
import handler_previous from '../handlers/burialSitesGet/previous.js'
import handler_search from '../handlers/burialSitesGet/search.js'
import handler_view from '../handlers/burialSitesGet/view.js'
import handler_doAddBurialSiteComment from '../handlers/burialSitesPost/doAddBurialSiteComment.js'
import handler_doCreateBurialSite from '../handlers/burialSitesPost/doCreateBurialSite.js'
import handler_doDeleteBurialSite from '../handlers/burialSitesPost/doDeleteBurialSite.js'
import handler_doDeleteBurialSiteComment from '../handlers/burialSitesPost/doDeleteBurialSiteComment.js'
import handler_doGetBurialSiteNamesByRange from '../handlers/burialSitesPost/doGetBurialSiteNamesByRange.js'
import handler_doGetBurialSitesForMap from '../handlers/burialSitesPost/doGetBurialSitesForMap.js'
import handler_doGetBurialSiteTypeFields from '../handlers/burialSitesPost/doGetBurialSiteTypeFields.js'
import handler_doRestoreBurialSite from '../handlers/burialSitesPost/doRestoreBurialSite.js'
import handler_doSearchBurialSites from '../handlers/burialSitesPost/doSearchBurialSites.js'
import handler_doSearchBurialSitesForGps from '../handlers/burialSitesPost/doSearchBurialSitesForGps.js'
import handler_doUpdateBurialSite from '../handlers/burialSitesPost/doUpdateBurialSite.js'
import handler_doUpdateBurialSiteComment from '../handlers/burialSitesPost/doUpdateBurialSiteComment.js'
import handler_doUpdateBurialSiteLatitudeLongitude from '../handlers/burialSitesPost/doUpdateBurialSiteLatitudeLongitude.js'
import handler_doGetRecordAuditLog from '../handlers/commonPost/doGetRecordAuditLog.js'
import {
  adminPostHandler,
  updateCemeteriesGetHandler,
  updateCemeteriesPostHandler
} from '../handlers/permissions.js'
import { getConfigProperty } from '../helpers/config.helpers.js'

export const router = Router()

/*
 * Burial Site Search
 */

router
  .get('/', handler_search)
  .post('/doSearchBurialSites', handler_doSearchBurialSites)

/*
 * GPS Coordinate Capture
 */

router
  .get('/gpsCapture', updateCemeteriesGetHandler, handler_gpsCapture)
  .post(
    '/doSearchBurialSitesForGPS',
    updateCemeteriesPostHandler,
    handler_doSearchBurialSitesForGps
  )
  .post(
    '/doUpdateBurialSiteLatitudeLongitude',
    updateCemeteriesPostHandler,
    handler_doUpdateBurialSiteLatitudeLongitude
  )

/*
 * Burial Site Map
 */

router
  .get('/map', handler_map)
  .post('/doGetBurialSitesForMap', handler_doGetBurialSitesForMap)

/*
 * Burial Site Creator
 */

router
  .get('/creator', updateCemeteriesGetHandler, handler_creator)
  .post(
    '/doGetBurialSiteNamesByRange',
    updateCemeteriesPostHandler,
    handler_doGetBurialSiteNamesByRange
  )

/*
 * Burial Site View / Edit
 */

router.get('/new', updateCemeteriesGetHandler, handler_new)

router
  .get('/:burialSiteId', handler_view)
  .get('/:burialSiteId/next', handler_next)
  .get('/:burialSiteId/previous', handler_previous)

router
  .get('/:burialSiteId/edit', updateCemeteriesGetHandler, handler_edit)
  .post(
    '/doGetBurialSiteTypeFields',
    updateCemeteriesPostHandler,
    handler_doGetBurialSiteTypeFields
  )
  .post(
    '/doCreateBurialSite',
    updateCemeteriesPostHandler,
    handler_doCreateBurialSite
  )
  .post(
    '/doUpdateBurialSite',
    updateCemeteriesPostHandler,
    handler_doUpdateBurialSite
  )
  .post(
    '/doDeleteBurialSite',
    updateCemeteriesPostHandler,
    handler_doDeleteBurialSite
  )
  .post('/doRestoreBurialSite', adminPostHandler, handler_doRestoreBurialSite)

/*
 * Burial Site Comments
 */

router
  .post(
    '/doAddBurialSiteComment',
    updateCemeteriesPostHandler,
    handler_doAddBurialSiteComment
  )
  .post(
    '/doUpdateBurialSiteComment',
    updateCemeteriesPostHandler,
    handler_doUpdateBurialSiteComment
  )
  .post(
    '/doDeleteBurialSiteComment',
    updateCemeteriesPostHandler,
    handler_doDeleteBurialSiteComment
  )

if (getConfigProperty('settings.auditLog.enabled')) {
  router.post(
    '/doGetRecordAuditLog',
    updateCemeteriesPostHandler,
    handler_doGetRecordAuditLog('burialSite')
  )
}

export default router
