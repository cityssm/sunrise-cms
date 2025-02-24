import { Router } from 'express'

import handler_edit from '../handlers/cemeteries-get/edit.js'
import handler_new from '../handlers/cemeteries-get/new.js'
import handler_next from '../handlers/cemeteries-get/next.js'
import handler_previous from '../handlers/cemeteries-get/previous.js'
import handler_search from '../handlers/cemeteries-get/search.js'
import handler_view from '../handlers/cemeteries-get/view.js'
import handler_doCreateMap from '../handlers/cemeteries-post/doCreateCemetery.js'
import handler_doDeleteMap from '../handlers/cemeteries-post/doDeleteCemetery.js'
import handler_doUpdateMap from '../handlers/cemeteries-post/doUpdateMap.js'
import { updateGetHandler, updatePostHandler } from '../handlers/permissions.js'

export const router = Router()

router.get('/', handler_search)

router.get('/new', updateGetHandler, handler_new)

router.get('/:cemeteryId', handler_view)

router.get('/:cemeteryId/next', handler_next)

router.get('/:cemeteryId/previous', handler_previous)

router.get('/:cemeteryId/edit', updateGetHandler, handler_edit)

router.post(
  '/doCreateCemetery',
  updatePostHandler,
  handler_doCreateMap
)

router.post(
  '/doUpdateCemetery',
  updatePostHandler,
  handler_doUpdateMap
)

router.post(
  '/doDeleteCemetery',
  updatePostHandler,
  handler_doDeleteMap
)

export default router
