import { Router } from 'express'

import handler_edit from '../handlers/contracts-get/edit.js'
import handler_new from '../handlers/contracts-get/new.js'
import handler_search from '../handlers/contracts-get/search.js'
import handler_view from '../handlers/contracts-get/view.js'
import handler_doAddLotOccupancyComment from '../handlers/contracts-post/doAddLotOccupancyComment.js'
import handler_doAddLotOccupancyFee from '../handlers/contracts-post/doAddLotOccupancyFee.js'
import handler_doAddLotOccupancyFeeCategory from '../handlers/contracts-post/doAddLotOccupancyFeeCategory.js'
import handler_doAddLotOccupancyOccupant from '../handlers/contracts-post/doAddLotOccupancyOccupant.js'
import handler_doAddLotOccupancyTransaction from '../handlers/contracts-post/doAddLotOccupancyTransaction.js'
import handler_doCopyLotOccupancy from '../handlers/contracts-post/doCopyLotOccupancy.js'
import handler_doCreateLotOccupancy from '../handlers/contracts-post/doCreateLotOccupancy.js'
import handler_doDeleteLotOccupancy from '../handlers/contracts-post/doDeleteLotOccupancy.js'
import handler_doDeleteLotOccupancyComment from '../handlers/contracts-post/doDeleteLotOccupancyComment.js'
import handler_doDeleteLotOccupancyFee from '../handlers/contracts-post/doDeleteLotOccupancyFee.js'
import handler_doDeleteLotOccupancyOccupant from '../handlers/contracts-post/doDeleteLotOccupancyOccupant.js'
import handler_doDeleteLotOccupancyTransaction from '../handlers/contracts-post/doDeleteLotOccupancyTransaction.js'
import handler_doGetDynamicsGPDocument from '../handlers/contracts-post/doGetDynamicsGPDocument.js'
import handler_doGetFees from '../handlers/contracts-post/doGetFees.js'
import handler_doGetContractTypeFields from '../handlers/contracts-post/doGetContractTypeFields.js'
import handler_doSearchLotOccupancies from '../handlers/contracts-post/doSearchLotOccupancies.js'
import handler_doSearchPastOccupants from '../handlers/contracts-post/doSearchPastOccupants.js'
import handler_doUpdateLotOccupancy from '../handlers/contracts-post/doUpdateLotOccupancy.js'
import handler_doUpdateLotOccupancyComment from '../handlers/contracts-post/doUpdateLotOccupancyComment.js'
import handler_doUpdateLotOccupancyFeeQuantity from '../handlers/contracts-post/doUpdateLotOccupancyFeeQuantity.js'
import handler_doUpdateLotOccupancyOccupant from '../handlers/contracts-post/doUpdateLotOccupancyOccupant.js'
import handler_doUpdateLotOccupancyTransaction from '../handlers/contracts-post/doUpdateLotOccupancyTransaction.js'
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
  '/doGetContractTypeFields',
  updatePostHandler,
  handler_doGetContractTypeFields
)

router.post(
  '/doCreateLotOccupancy',
  updatePostHandler,
  handler_doCreateLotOccupancy
)

// View

router.get('/:burialSiteContractId', handler_view)

// Edit

router.get(
  '/:burialSiteContractId/edit',
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
