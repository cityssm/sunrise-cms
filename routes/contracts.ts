import { Router } from 'express'

import handler_attachment from '../handlers/contracts-get/attachment.js'
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
import handler_doAddRelatedContract from '../handlers/contracts-post/doAddRelatedContract.js'
import handler_doCopyContract from '../handlers/contracts-post/doCopyContract.js'
import handler_doCreateContract from '../handlers/contracts-post/doCreateContract.js'
import handler_doDeleteContract from '../handlers/contracts-post/doDeleteContract.js'
import handler_doDeleteContractComment from '../handlers/contracts-post/doDeleteContractComment.js'
import handler_doDeleteContractFee from '../handlers/contracts-post/doDeleteContractFee.js'
import handler_doDeleteContractInterment from '../handlers/contracts-post/doDeleteContractInterment.js'
import handler_doDeleteContractTransaction from '../handlers/contracts-post/doDeleteContractTransaction.js'
import handler_doDeleteRelatedContract from '../handlers/contracts-post/doDeleteRelatedContract.js'
import handler_doGetBurialSiteDirectionsOfArrival from '../handlers/contracts-post/doGetBurialSiteDirectionsOfArrival.js'
import handler_doGetContractDetailsForConsignoCloud from '../handlers/contracts-post/doGetContractDetailsForConsignoCloud.js'
import handler_doGetContractTypeFields from '../handlers/contracts-post/doGetContractTypeFields.js'
import handler_doGetDynamicsGPDocument from '../handlers/contracts-post/doGetDynamicsGPDocument.js'
import handler_doGetFees from '../handlers/contracts-post/doGetFees.js'
import handler_doGetPossibleRelatedContracts from '../handlers/contracts-post/doGetPossibleRelatedContracts.js'
import handler_doSearchContracts from '../handlers/contracts-post/doSearchContracts.js'
import handler_doStartConsignoCloudWorkflow from '../handlers/contracts-post/doStartConsignoCloudWorkflow.js'
import handler_doUpdateContract from '../handlers/contracts-post/doUpdateContract.js'
import handler_doUpdateContractComment from '../handlers/contracts-post/doUpdateContractComment.js'
import handler_doUpdateContractFeeQuantity from '../handlers/contracts-post/doUpdateContractFeeQuantity.js'
import handler_doUpdateContractInterment from '../handlers/contracts-post/doUpdateContractInterment.js'
import handler_doUpdateContractTransaction from '../handlers/contracts-post/doUpdateContractTransaction.js'
import {
  updateContractsGetHandler,
  updateContractsPostHandler
} from '../handlers/permissions.js'
import { getConfigProperty } from '../helpers/config.helpers.js'

export const router = Router()

// Search

router.get('/', handler_search)

router.post('/doSearchContracts', handler_doSearchContracts)

// Create

router.get('/new', updateContractsGetHandler, handler_new)

router.post(
  '/doGetContractTypeFields',
  updateContractsPostHandler,
  handler_doGetContractTypeFields
)

router.post(
  '/doCreateContract',
  updateContractsPostHandler,
  handler_doCreateContract
)

// View

router.get('/:contractId', handler_view)

router.get('/:contractId/next', handler_next)

router.get('/:contractId/previous', handler_previous)

// Edit

router.get('/:contractId/edit', updateContractsGetHandler, handler_edit)

router.post(
  '/doUpdateContract',
  updateContractsPostHandler,
  handler_doUpdateContract
)

router.post(
  '/doCopyContract',
  updateContractsPostHandler,
  handler_doCopyContract
)

router.post(
  '/doDeleteContract',
  updateContractsPostHandler,
  handler_doDeleteContract
)

router.post(
  '/doGetBurialSiteDirectionsOfArrival',
  updateContractsPostHandler,
  handler_doGetBurialSiteDirectionsOfArrival
)

// Interments

router.post(
  '/doAddContractInterment',
  updateContractsPostHandler,
  handler_doAddContractInterment
)

router.post(
  '/doUpdateContractInterment',
  updateContractsPostHandler,
  handler_doUpdateContractInterment
)

router.post(
  '/doDeleteContractInterment',
  updateContractsPostHandler,
  handler_doDeleteContractInterment
)

// Comments

router.post(
  '/doAddContractComment',
  updateContractsPostHandler,
  handler_doAddContractComment
)

router.post(
  '/doUpdateContractComment',
  updateContractsPostHandler,
  handler_doUpdateContractComment
)

router.post(
  '/doDeleteContractComment',
  updateContractsPostHandler,
  handler_doDeleteContractComment
)

// Fees

router.post('/doGetFees', updateContractsPostHandler, handler_doGetFees)

router.post(
  '/doAddContractFee',
  updateContractsPostHandler,
  handler_doAddContractFee
)

router.post(
  '/doAddContractFeeCategory',
  updateContractsPostHandler,
  handler_doAddContractFeeCategory
)

router.post(
  '/doUpdateContractFeeQuantity',
  updateContractsPostHandler,
  handler_doUpdateContractFeeQuantity
)

router.post(
  '/doDeleteContractFee',
  updateContractsPostHandler,
  handler_doDeleteContractFee
)

// Transactions

if (getConfigProperty('integrations.dynamicsGP.integrationIsEnabled')) {
  router.post(
    '/doGetDynamicsGPDocument',
    updateContractsPostHandler,
    handler_doGetDynamicsGPDocument
  )
}

router.post(
  '/doAddContractTransaction',
  updateContractsPostHandler,
  handler_doAddContractTransaction
)

router.post(
  '/doUpdateContractTransaction',
  updateContractsPostHandler,
  handler_doUpdateContractTransaction
)

router.post(
  '/doDeleteContractTransaction',
  updateContractsPostHandler,
  handler_doDeleteContractTransaction
)

// Consigno Cloud

if (getConfigProperty('integrations.consignoCloud.integrationIsEnabled')) {
  router.post(
    '/doGetContractDetailsForConsignoCloud',
    updateContractsPostHandler,
    handler_doGetContractDetailsForConsignoCloud
  )

  router.post(
    '/doStartConsignoCloudWorkflow',
    updateContractsPostHandler,
    handler_doStartConsignoCloudWorkflow
  )
}

// Attachments

router.get('/attachment/:attachmentId', handler_attachment)

// Related Contracts

router.post(
  '/doGetPossibleRelatedContracts',
  updateContractsPostHandler,
  handler_doGetPossibleRelatedContracts
)

router.post(
  '/doAddRelatedContract',
  updateContractsPostHandler,
  handler_doAddRelatedContract
)

router.post(
  '/doDeleteRelatedContract',
  updateContractsPostHandler,
  handler_doDeleteRelatedContract
)

export default router
