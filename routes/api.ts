import { Router } from 'express'

import handler_milestoneICS from '../handlers/apiGet/milestoneICS.js'

export default function getApiRouter(): Router {
  const router = Router()

  router.get('/milestoneICS', handler_milestoneICS)

  return router
}
