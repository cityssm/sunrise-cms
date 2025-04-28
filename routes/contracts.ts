import { Router } from 'express'

import handler_edit from '../handlers/contracts-get/edit.js'
import handler_new from '../handlers/contracts-get/new.js'
import handler_next from '../handlers/contracts-get/next.js'
import handler_previous from '../handlers/contracts-get/previous.js'
import handler_search from '../handlers/contracts-get/search.js'
import handler_view from '../handlers/contracts-get/view.js'
import handler_doAddContractComment from '../handlers/contracts-post/doAddContractComment.js'
import handler_doAddContractFee from '../handlers/contracts-post/doAddContractFee.js'
import handler_doAddContractFeeCategory from '../handlers/contracts-post/doAddContractFeeCategory.js'
import handler_doAddContractInterment from '../handlers/contracts-post/doAddContractInterment.js'
import handler_doAddContractTransaction from '../handlers/contracts-post/doAddContractTransaction.js'
import handler_doCopyContract from '../handlers/contracts-post/doCopyContract.js'
import handler_doCreateContract from '../handlers/contracts-post/doCreateContract.js'
import handler_doDeleteContract from '../handlers/contracts-post/doDeleteContract.js'
import handler_doDeleteContractComment from '../handlers/contracts-post/doDeleteContractComment.js'
import handler_doDeleteContractFee from '../handlers/contracts-post/doDeleteContractFee.js'
import handler_doDeleteContractInterment from '../handlers/contracts-post/doDeleteContractInterment.js'
import handler_doDeleteContractTransaction from '../handlers/contracts-post/doDeleteContractTransaction.js'
import handler_doGetBurialSiteDirectionsOfArrival from '../handlers/contracts-post/doGetBurialSiteDirectionsOfArrival.js'
import handler_doGetContractTypeFields from '../handlers/contracts-post/doGetContractTypeFields.js'
import handler_doGetDynamicsGPDocument from '../handlers/contracts-post/doGetDynamicsGPDocument.js'
import handler_doGetFees from '../handlers/contracts-post/doGetFees.js'
import handler_doSearchContracts from '../handlers/contracts-post/doSearchContracts.js'
import handler_doUpdateContract from '../handlers/contracts-post/doUpdateContract.js'
import handler_doUpdateContractComment from '../handlers/contracts-post/doUpdateContractComment.js'
import handler_doUpdateContractFeeQuantity from '../handlers/contracts-post/doUpdateContractFeeQuantity.js'
import handler_doUpdateContractInterment from '../handlers/contracts-post/doUpdateContractInterment.js'
import handler_doUpdateContractTransaction from '../handlers/contracts-post/doUpdateContractTransaction.js'
import { updateGetHandler, updatePostHandler } from '../handlers/permissions.js'
import { getConfigProperty } from '../helpers/config.helpers.js'

export const router = Router()

// Search

router.get('/', handler_search)

router.post('/doSearchContracts', handler_doSearchContracts)

// Create

router.get('/new', updateGetHandler, handler_new)

router.post(
  '/doGetContractTypeFields',
  updatePostHandler,
  handler_doGetContractTypeFields
)

router.post('/doCreateContract', updatePostHandler, handler_doCreateContract)

// View

router.get('/:contractId', handler_view)

router.get('/:contractId/next', handler_next)

router.get('/:contractId/previous', handler_previous)

// Edit

router.get('/:contractId/edit', updateGetHandler, handler_edit)

router.post('/doUpdateContract', updatePostHandler, handler_doUpdateContract)

router.post('/doCopyContract', updatePostHandler, handler_doCopyContract)

router.post('/doDeleteContract', updatePostHandler, handler_doDeleteContract)

router.post(
  '/doGetBurialSiteDirectionsOfArrival',
  updatePostHandler,
  handler_doGetBurialSiteDirectionsOfArrival
)

// Interments

router.post(
  '/doAddContractInterment',
  updatePostHandler,
  handler_doAddContractInterment
)

router.post(
  '/doUpdateContractInterment',
  updatePostHandler,
  handler_doUpdateContractInterment
)

router.post(
  '/doDeleteContractInterment',
  updatePostHandler,
  handler_doDeleteContractInterment
)

// Comments

router.post(
  '/doAddContractComment',
  updatePostHandler,
  handler_doAddContractComment
)

router.post(
  '/doUpdateContractComment',
  updatePostHandler,
  handler_doUpdateContractComment
)

router.post(
  '/doDeleteContractComment',
  updatePostHandler,
  handler_doDeleteContractComment
)

// Fees

router.post('/doGetFees', updatePostHandler, handler_doGetFees)

router.post('/doAddContractFee', updatePostHandler, handler_doAddContractFee)

router.post(
  '/doAddContractFeeCategory',
  updatePostHandler,
  handler_doAddContractFeeCategory
)

router.post(
  '/doUpdateContractFeeQuantity',
  updatePostHandler,
  handler_doUpdateContractFeeQuantity
)

router.post(
  '/doDeleteContractFee',
  updatePostHandler,
  handler_doDeleteContractFee
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
  '/doAddContractTransaction',
  updatePostHandler,
  handler_doAddContractTransaction
)

router.post(
  '/doUpdateContractTransaction',
  updatePostHandler,
  handler_doUpdateContractTransaction
)

router.post(
  '/doDeleteContractTransaction',
  updatePostHandler,
  handler_doDeleteContractTransaction
)

export default router
