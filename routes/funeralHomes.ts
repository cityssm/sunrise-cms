import { Router } from 'express'

import handler_edit from '../handlers/funeralHomes-get/edit.js'
import handler_new from '../handlers/funeralHomes-get/new.js'
import handler_next from '../handlers/funeralHomes-get/next.js'
import handler_previous from '../handlers/funeralHomes-get/previous.js'
import handler_search from '../handlers/funeralHomes-get/search.js'
import handler_view from '../handlers/funeralHomes-get/view.js'
import handler_doCreateFuneralHome from '../handlers/funeralHomes-post/doCreateFuneralHome.js'
import handler_doDeleteFuneralHome from '../handlers/funeralHomes-post/doDeleteFuneralHome.js'
import handler_doRestoreFuneralHome from '../handlers/funeralHomes-post/doRestoreFuneralHome.js'
import handler_doUpdateFuneralHome from '../handlers/funeralHomes-post/doUpdateFuneralHome.js'
import {
  adminPostHandler,
  updateContractsGetHandler,
  updateContractsPostHandler
} from '../handlers/permissions.js'

export const router = Router()

router.get('/', handler_search)

router
  .get('/new', updateContractsGetHandler, handler_new)
  .post(
    '/doCreateFuneralHome',
    updateContractsPostHandler,
    handler_doCreateFuneralHome
  )

router
  .get('/:funeralHomeId', handler_view)
  .get('/:funeralHomeId/next', handler_next)
  .get('/:funeralHomeId/previous', handler_previous)
  .post('/doRestoreFuneralHome', adminPostHandler, handler_doRestoreFuneralHome)

router
  .get('/:funeralHomeId/edit', updateContractsGetHandler, handler_edit)
  .post(
    '/doUpdateFuneralHome',
    updateContractsPostHandler,
    handler_doUpdateFuneralHome
  )
  .post(
    '/doDeleteFuneralHome',
    updateContractsPostHandler,
    handler_doDeleteFuneralHome
  )

export default router
