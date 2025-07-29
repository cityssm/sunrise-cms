import {
  type ConsignoCloudAPIBaseUrl,
  type CreateWorkflowAnchor,
  type CreateWorkflowRequest,
  ConsignoCloudAPI,
  utilities as consignoCloudUtilities
} from '@cityssm/consigno-cloud-api'
import {
  CreateWorkflowStatus,
  PDFAPolicy
} from '@cityssm/consigno-cloud-api/lookups.js'
import type { DateString } from '@cityssm/utils-datetime'

import { updateConsignoCloudMetadata } from '../../database/updateConsignoCloudMetadata.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import { generatePdf } from '../../helpers/pdf.helpers.js'
import {
  type PrintConfigWithPath,
  getPrintConfig
} from '../../helpers/print.helpers.js'

import { userHasConsignoCloudAccess } from './helpers.js'

export interface StartConsignoCloudWorkflowForm {
  contractId: string

  workflowExpiresOn: DateString
  workflowTitle: string

  printNames: string | string[]

  signerFirstName: string
  signerLastName: string

  signerAmr: 'call' | 'sms'
  signerEmail: string
  signerPhone: string
}

export default async function startConsignoCloudWorkflow(
  form: StartConsignoCloudWorkflowForm,
  user: User
): Promise<{
  workflowId: string
  workflowEditUrl: string
}> {
  const userIsAllowed = userHasConsignoCloudAccess(user)

  if (!userIsAllowed) {
    throw new Error('User does not have access to Consigno Cloud')
  }

  /*
   * Build the workflow definition
   */

  const workflowDefinition: CreateWorkflowRequest = {
    name: form.workflowTitle,

    expiresOn: form.workflowExpiresOn,
    pdfaPolicy: PDFAPolicy.Preferred,
    status: CreateWorkflowStatus.Create,

    documents: [],

    actions: [
      {
        mode: 'remote',

        step: 1,
        zoneLabel: 'Sign Here',

        ref: '1',

        signer: {
          type: 'esig',

          firstName: form.signerFirstName,
          lastName: form.signerLastName,

          email: form.signerEmail,
          phone: form.signerPhone,

          amr: ['link', form.signerAmr],

          placeHolder: false
        }
      }
    ],

    notifications: []
  }

  const printNames = Array.isArray(form.printNames)
    ? form.printNames
    : [form.printNames]

  for (const printName of printNames) {
    const printConfig = getPrintConfig(printName)

    if (printConfig === undefined) {
      throw new Error(`Print configuration not found for print: ${printName}`)
    }

    const pdfData = await generatePdf(printConfig as PrintConfigWithPath, {
      contractId: form.contractId
    })

    const anchors: CreateWorkflowAnchor[] = []

    for (const anchor of printConfig.consignoCloud?.anchors ?? []) {
      anchors.push({
        tag: anchor.tag,
        xOffset: anchor.xOffset,
        yOffset: anchor.yOffset,

        height: anchor.height,
        width: anchor.width,

        assignedTo: '1',
        page: anchor.page,

        skipIfNotFound: true
      })
    }

    workflowDefinition.documents.push({
      name: printConfig.title,

      data: consignoCloudUtilities.uintArrayToBase64(pdfData),

      anchors
    })
  }

  /*
   * Create the workflow
   */

  const consignoCloudAPI = new ConsignoCloudAPI({
    apiKey: getConfigProperty('integrations.consignoCloud.apiKey'),
    apiSecret: getConfigProperty('integrations.consignoCloud.apiSecret'),
    baseUrl: getConfigProperty(
      'integrations.consignoCloud.baseUrl'
    ) as ConsignoCloudAPIBaseUrl
  }).setLoginAs(
    user.userSettings['consignoCloud.userName'] ?? '',
    user.userSettings['consignoCloud.thirdPartyApplicationPassword'] ?? ''
  )

  const workflowResponse =
    await consignoCloudAPI.createWorkflow(workflowDefinition)

  const workflowId = workflowResponse.response.id

  const workflowStatus = workflowResponse.response.status

  const workflowEditUrl = workflowResponse.response.editUrl

  updateConsignoCloudMetadata(
    form.contractId,
    {
      workflowEditUrl,
      workflowId,
      workflowStatus
    },
    user
  )

  return {
    workflowId,
    workflowEditUrl
  }
}
