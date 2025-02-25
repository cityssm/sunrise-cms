import { Router } from 'express'

import handler_edit from '../handlers/contracts-get/edit.js'
import handler_new from '../handlers/contracts-get/new.js'
import handler_search from '../handlers/contracts-get/search.js'
import handler_view from '../handlers/contracts-get/view.js'
import handler_doAddBurialSiteContractComment from '../handlers/contracts-post/doAddBurialSiteContractComment.js'
import handler_doAddBurialSiteContractFee from '../handlers/contracts-post/doAddBurialSiteContractFee.js'
import handler_doAddBurialSiteContractFeeCategory from '../handlers/contracts-post/doAddBurialSiteContractFeeCategory.js'
import handler_doAddBurialSiteContractTransaction from '../handlers/contracts-post/doAddBurialSiteContractTransaction.js'
import handler_doCopyBurialSiteContract from '../handlers/contracts-post/doCopyBurialSiteContract.js'
import handler_doCreateBurialSiteContract from '../handlers/contracts-post/doCreateBurialSiteContract.js'
import handler_doDeleteBurialSiteContract from '../handlers/contracts-post/doDeleteBurialSiteContract.js'
import handler_doDeleteBurialSiteContractComment from '../handlers/contracts-post/doDeleteBurialSiteContractComment.js'
import handler_doDeleteBurialSiteContractFee from '../handlers/contracts-post/doDeleteBurialSiteContractFee.js'
import handler_doDeleteBurialSiteContractTransaction from '../handlers/contracts-post/doDeleteBurialSiteContractTransaction.js'
import handler_doGetContractTypeFields from '../handlers/contracts-post/doGetContractTypeFields.js'
import handler_doGetDynamicsGPDocument from '../handlers/contracts-post/doGetDynamicsGPDocument.js'
import handler_doGetFees from '../handlers/contracts-post/doGetFees.js'
import handler_doSearchBurialSiteContracts from '../handlers/contracts-post/doSearchBurialSiteContracts.js'
import handler_doUpdateBurialSiteContract from '../handlers/contracts-post/doUpdateBurialSiteContract.js'
import handler_doUpdateBurialSiteContractComment from '../handlers/contracts-post/doUpdateBurialSiteContractComment.js'
import handler_doUpdateBurialSiteContractFeeQuantity from '../handlers/contracts-post/doUpdateBurialSiteContractFeeQuantity.js'
import handler_doUpdateBurialSiteContractTransaction from '../handlers/contracts-post/doUpdateBurialSiteContractTransaction.js'
import { updateGetHandler, updatePostHandler } from '../handlers/permissions.js'
import { getConfigProperty } from '../helpers/config.helpers.js'

export const router = Router()

// Search

router.get('/', handler_search)

router.post(
  '/doSearchBurialSiteContracts',
  handler_doSearchBurialSiteContracts
)

// Create

router.get('/new', updateGetHandler, handler_new)

router.post(
  '/doGetContractTypeFields',
  updatePostHandler,
  handler_doGetContractTypeFields
)

router.post(
  '/doCreateBurialSiteContract',
  updatePostHandler,
  handler_doCreateBurialSiteContract
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
  '/doUpdateBurialSiteContract',
  updatePostHandler,
  handler_doUpdateBurialSiteContract
)

router.post(
  '/doCopyBurialSiteContract',
  updatePostHandler,
  handler_doCopyBurialSiteContract
)

router.post(
  '/doDeleteBurialSiteContract',
  updatePostHandler,
  handler_doDeleteBurialSiteContract
)

// Comments

router.post(
  '/doAddBurialSiteContractComment',
  updatePostHandler,
  handler_doAddBurialSiteContractComment
)

router.post(
  '/doUpdateBurialSiteContractComment',
  updatePostHandler,
  handler_doUpdateBurialSiteContractComment
)

router.post(
  '/doDeleteBurialSiteContractComment',
  updatePostHandler,
  handler_doDeleteBurialSiteContractComment
)

// Fees

router.post(
  '/doGetFees',
  updatePostHandler,
  handler_doGetFees
)

router.post(
  '/doAddBurialSiteContractFee',
  updatePostHandler,
  handler_doAddBurialSiteContractFee
)

router.post(
  '/doAddBurialSiteContractFeeCategory',
  updatePostHandler,
  handler_doAddBurialSiteContractFeeCategory
)

router.post(
  '/doUpdateBurialSiteContractFeeQuantity',
  updatePostHandler,
  handler_doUpdateBurialSiteContractFeeQuantity
)

router.post(
  '/doDeleteBurialSiteContractFee',
  updatePostHandler,
  handler_doDeleteBurialSiteContractFee
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
  '/doAddBurialSiteContractTransaction',
  updatePostHandler,
  handler_doAddBurialSiteContractTransaction
)

router.post(
  '/doUpdateBurialSiteContractTransaction',
  updatePostHandler,
  handler_doUpdateBurialSiteContractTransaction
)

router.post(
  '/doDeleteBurialSiteContractTransaction',
  updatePostHandler,
  handler_doDeleteBurialSiteContractTransaction
)

export default router
