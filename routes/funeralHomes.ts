import { Router } from 'express'

import handler_edit from '../handlers/funeralHomes-get/edit.js'
import handler_new from '../handlers/funeralHomes-get/new.js'
import handler_search from '../handlers/funeralHomes-get/search.js'
import handler_view from '../handlers/funeralHomes-get/view.js'
import handler_doCreateFuneralHome from '../handlers/funeralHomes-post/doCreateFuneralHome.js'
import handler_doDeleteFuneralHome from '../handlers/funeralHomes-post/doDeleteFuneralHome.js'
import handler_doUpdateFuneralHome from '../handlers/funeralHomes-post/doUpdateFuneralHome.js'
import { updateGetHandler, updatePostHandler } from '../handlers/permissions.js'

export const router = Router()

router.get('/', handler_search)

router.get('/new', updateGetHandler, handler_new)

router.get('/:funeralHomeId', handler_view)

router.post(
  '/doCreateFuneralHome',
  updatePostHandler,
  handler_doCreateFuneralHome
)

router.get('/:funeralHomeId/edit', updateGetHandler, handler_edit)

router.post(
  '/doUpdateFuneralHome',
  updatePostHandler,
  handler_doUpdateFuneralHome
)

router.post(
  '/doDeleteFuneralHome',
  updatePostHandler,
  handler_doDeleteFuneralHome
)

export default router
