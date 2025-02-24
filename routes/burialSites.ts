import { Router } from 'express'

import handler_edit from '../handlers/burialSites-get/edit.js'
import handler_new from '../handlers/burialSites-get/new.js'
import handler_next from '../handlers/burialSites-get/next.js'
import handler_previous from '../handlers/burialSites-get/previous.js'
import handler_search from '../handlers/burialSites-get/search.js'
import handler_view from '../handlers/burialSites-get/view.js'
import handler_doAddLotComment from '../handlers/burialSites-post/doAddLotComment.js'
import handler_doCreateLot from '../handlers/burialSites-post/doCreateLot.js'
import handler_doDeleteLot from '../handlers/burialSites-post/doDeleteLot.js'
import handler_doDeleteLotComment from '../handlers/burialSites-post/doDeleteLotComment.js'
import handler_doGetBurialSiteTypeFields from '../handlers/burialSites-post/doGetBurialSiteTypeFields.js'
import handler_doSearchLots from '../handlers/burialSites-post/doSearchLots.js'
import handler_doUpdateLot from '../handlers/burialSites-post/doUpdateLot.js'
import handler_doUpdateLotComment from '../handlers/burialSites-post/doUpdateLotComment.js'
import { updateGetHandler, updatePostHandler } from '../handlers/permissions.js'

export const router = Router()

/*
 * Lot Search
 */

router.get('/', handler_search)

router.post('/doSearchLots', handler_doSearchLots)

/*
 * Lot View / Edit
 */

router.get('/new', updateGetHandler, handler_new)

router.get('/:lotId', handler_view)

router.get('/:lotId/next', handler_next)

router.get('/:lotId/previous', handler_previous)

router.get('/:lotId/edit', updateGetHandler, handler_edit)

router.post(
  '/doGetBurialSiteTypeFields',
  updatePostHandler,
  handler_doGetBurialSiteTypeFields
)

router.post(
  '/doCreateLot',
  updatePostHandler,
  handler_doCreateLot
)

router.post(
  '/doUpdateLot',
  updatePostHandler,
  handler_doUpdateLot
)

router.post(
  '/doDeleteLot',
  updatePostHandler,
  handler_doDeleteLot
)

router.post(
  '/doAddLotComment',
  updatePostHandler,
  handler_doAddLotComment
)

router.post(
  '/doUpdateLotComment',
  updatePostHandler,
  handler_doUpdateLotComment
)

router.post(
  '/doDeleteLotComment',
  updatePostHandler,
  handler_doDeleteLotComment
)

export default router
