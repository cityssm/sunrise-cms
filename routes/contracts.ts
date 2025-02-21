import { Router } from 'express'

import handler_edit from '../handlers/lotOccupancies-get/edit.js'
import handler_new from '../handlers/lotOccupancies-get/new.js'
import handler_search from '../handlers/lotOccupancies-get/search.js'
import handler_view from '../handlers/lotOccupancies-get/view.js'
import handler_doAddLotOccupancyComment from '../handlers/lotOccupancies-post/doAddLotOccupancyComment.js'
import handler_doAddLotOccupancyFee from '../handlers/lotOccupancies-post/doAddLotOccupancyFee.js'
import handler_doAddLotOccupancyFeeCategory from '../handlers/lotOccupancies-post/doAddLotOccupancyFeeCategory.js'
import handler_doAddLotOccupancyOccupant from '../handlers/lotOccupancies-post/doAddLotOccupancyOccupant.js'
import handler_doAddLotOccupancyTransaction from '../handlers/lotOccupancies-post/doAddLotOccupancyTransaction.js'
import handler_doCopyLotOccupancy from '../handlers/lotOccupancies-post/doCopyLotOccupancy.js'
import handler_doCreateLotOccupancy from '../handlers/lotOccupancies-post/doCreateLotOccupancy.js'
import handler_doDeleteLotOccupancy from '../handlers/lotOccupancies-post/doDeleteLotOccupancy.js'
import handler_doDeleteLotOccupancyComment from '../handlers/lotOccupancies-post/doDeleteLotOccupancyComment.js'
import handler_doDeleteLotOccupancyFee from '../handlers/lotOccupancies-post/doDeleteLotOccupancyFee.js'
import handler_doDeleteLotOccupancyOccupant from '../handlers/lotOccupancies-post/doDeleteLotOccupancyOccupant.js'
import handler_doDeleteLotOccupancyTransaction from '../handlers/lotOccupancies-post/doDeleteLotOccupancyTransaction.js'
import handler_doGetDynamicsGPDocument from '../handlers/lotOccupancies-post/doGetDynamicsGPDocument.js'
import handler_doGetFees from '../handlers/lotOccupancies-post/doGetFees.js'
import handler_doGetOccupancyTypeFields from '../handlers/lotOccupancies-post/doGetOccupancyTypeFields.js'
import handler_doSearchLotOccupancies from '../handlers/lotOccupancies-post/doSearchLotOccupancies.js'
import handler_doSearchPastOccupants from '../handlers/lotOccupancies-post/doSearchPastOccupants.js'
import handler_doUpdateLotOccupancy from '../handlers/lotOccupancies-post/doUpdateLotOccupancy.js'
import handler_doUpdateLotOccupancyComment from '../handlers/lotOccupancies-post/doUpdateLotOccupancyComment.js'
import handler_doUpdateLotOccupancyFeeQuantity from '../handlers/lotOccupancies-post/doUpdateLotOccupancyFeeQuantity.js'
import handler_doUpdateLotOccupancyOccupant from '../handlers/lotOccupancies-post/doUpdateLotOccupancyOccupant.js'
import handler_doUpdateLotOccupancyTransaction from '../handlers/lotOccupancies-post/doUpdateLotOccupancyTransaction.js'
import { updateGetHandler, updatePostHandler } from '../handlers/permissions.js'
import { getConfigProperty } from '../helpers/config.helpers.js'

export const router = Router()

// Search

router.get('/', handler_search)

router.post(
  '/doSearchLotOccupancies',
  handler_doSearchLotOccupancies
)

// Create

router.get('/new', updateGetHandler, handler_new)

router.post(
  '/doGetOccupancyTypeFields',
  updatePostHandler,
  handler_doGetOccupancyTypeFields
)

router.post(
  '/doCreateLotOccupancy',
  updatePostHandler,
  handler_doCreateLotOccupancy
)

// View

router.get('/:lotOccupancyId', handler_view)

// Edit

router.get(
  '/:lotOccupancyId/edit',
  updateGetHandler,
  handler_edit
)

router.post(
  '/doUpdateLotOccupancy',
  updatePostHandler,
  handler_doUpdateLotOccupancy
)

router.post(
  '/doCopyLotOccupancy',
  updatePostHandler,
  handler_doCopyLotOccupancy
)

router.post(
  '/doDeleteLotOccupancy',
  updatePostHandler,
  handler_doDeleteLotOccupancy
)

// Occupants

router.post(
  '/doSearchPastOccupants',
  updatePostHandler,
  handler_doSearchPastOccupants
)

router.post(
  '/doAddLotOccupancyOccupant',
  updatePostHandler,
  handler_doAddLotOccupancyOccupant
)

router.post(
  '/doUpdateLotOccupancyOccupant',
  updatePostHandler,
  handler_doUpdateLotOccupancyOccupant
)

router.post(
  '/doDeleteLotOccupancyOccupant',
  updatePostHandler,
  handler_doDeleteLotOccupancyOccupant
)

// Comments

router.post(
  '/doAddLotOccupancyComment',
  updatePostHandler,
  handler_doAddLotOccupancyComment
)

router.post(
  '/doUpdateLotOccupancyComment',
  updatePostHandler,
  handler_doUpdateLotOccupancyComment
)

router.post(
  '/doDeleteLotOccupancyComment',
  updatePostHandler,
  handler_doDeleteLotOccupancyComment
)

// Fees

router.post(
  '/doGetFees',
  updatePostHandler,
  handler_doGetFees
)

router.post(
  '/doAddLotOccupancyFee',
  updatePostHandler,
  handler_doAddLotOccupancyFee
)

router.post(
  '/doAddLotOccupancyFeeCategory',
  updatePostHandler,
  handler_doAddLotOccupancyFeeCategory
)

router.post(
  '/doUpdateLotOccupancyFeeQuantity',
  updatePostHandler,
  handler_doUpdateLotOccupancyFeeQuantity
)

router.post(
  '/doDeleteLotOccupancyFee',
  updatePostHandler,
  handler_doDeleteLotOccupancyFee
)

// Transactions

if (getConfigProperty('settings.dynamicsGP.integrationIsEnabled')) {
  router.post(
    '/doGetDynamicsGPDocument',
    updatePostHandler,
    handler_doGetDynamicsGPDocument
  )
}

router.post(
  '/doAddLotOccupancyTransaction',
  updatePostHandler,
  handler_doAddLotOccupancyTransaction
)

router.post(
  '/doUpdateLotOccupancyTransaction',
  updatePostHandler,
  handler_doUpdateLotOccupancyTransaction
)

router.post(
  '/doDeleteLotOccupancyTransaction',
  updatePostHandler,
  handler_doDeleteLotOccupancyTransaction
)

export default router
