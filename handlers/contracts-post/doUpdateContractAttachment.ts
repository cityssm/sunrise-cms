import type { Request, Response } from 'express'

import getContract from '../../database/getContract.js'
import getContractAttachment from '../../database/getContractAttachment.js'
import getContractAttachments from '../../database/getContractAttachments.js'
import updateContractAttachment from '../../database/updateContractAttachment.js'

import type { ContractAttachment } from '../../types/record.types.js'

export interface UpdateContractAttachmentForm {
  contractAttachmentId: string
  attachmentTitle?: string
  attachmentDetails?: string
}


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoUpdateContractAttachmentResponse =
  { success: false; errorMessage: string }
  | { success: true; contractAttachments: ContractAttachment[] }

export default async function handler(
  request: Request<unknown, unknown, UpdateContractAttachmentForm>,
  response: Response<DoUpdateContractAttachmentResponse>
): Promise<void> {
  const contractAttachmentId = Number.parseInt(
    request.body.contractAttachmentId,
    10
  )

  // Get the attachment to verify it exists and get the contract ID
  const attachment = getContractAttachment(contractAttachmentId)
  if (attachment === undefined) {
    response.json({
      success: false,
      errorMessage: 'Attachment not found.'
    })
    return
  }

  const contractId = attachment.contractId as number

  // Verify contract exists
  const contract = await getContract(contractId)
  if (contract === undefined) {
    response.json({
      success: false,
      errorMessage: 'Contract not found.'
    })
    return
  }

  try {
    const success = updateContractAttachment(
      contractAttachmentId,
      {
        attachmentTitle: request.body.attachmentTitle ?? '',
        attachmentDetails: request.body.attachmentDetails ?? ''
      },
      request.session.user as User
    )

    if (!success) {
      response.json({
        success: false,
        errorMessage: 'Failed to update attachment.'
      })
      return
    }

    const contractAttachments = getContractAttachments(contractId)

    response.json({
      success: true,
      contractAttachments
    })
  } catch (error) {
    response.json({
      success: false,
      errorMessage: (error as Error).message
    })
  }
}
