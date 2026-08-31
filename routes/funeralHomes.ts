import { Router } from 'express'

import handler_doGetRecordAuditLog from '../handlers/commonPost/doGetRecordAuditLog.js'
import handler_edit from '../handlers/funeralHomesGet/edit.js'
import handler_new from '../handlers/funeralHomesGet/new.js'
import handler_next from '../handlers/funeralHomesGet/next.js'
import handler_previous from '../handlers/funeralHomesGet/previous.js'
import handler_search from '../handlers/funeralHomesGet/search.js'
import handler_view from '../handlers/funeralHomesGet/view.js'
import handler_doCreateFuneralHome from '../handlers/funeralHomesPost/doCreateFuneralHome.js'
import handler_doDeleteFuneralHome from '../handlers/funeralHomesPost/doDeleteFuneralHome.js'
import handler_doRestoreFuneralHome from '../handlers/funeralHomesPost/doRestoreFuneralHome.js'
import handler_doUpdateFuneralHome from '../handlers/funeralHomesPost/doUpdateFuneralHome.js'
import {
  adminPostHandler,
  updateContractsGetHandler,
  updateContractsPostHandler
} from '../handlers/permissions.js'
import { getConfigProperty } from '../helpers/config.helpers.js'

export default function getFuneralHomesRouter(): Router {
  const router = Router()

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

  if (getConfigProperty('settings.auditLog.enabled')) {
    router.post(
      '/doGetRecordAuditLog',
      updateContractsPostHandler,
      handler_doGetRecordAuditLog('funeralHome')
    )
  }

  return router
}
