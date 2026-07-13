import { Router } from 'express'

import handler_reportName from '../handlers/reportsGet/reportName.js'
import handler_search from '../handlers/reportsGet/search.js'

export const router = Router()

router.get('/', handler_search)

router.all('/:reportName', handler_reportName)

export default router
