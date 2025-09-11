import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import getContract from '../../database/getContract.js'
import getContractAttachment from '../../database/getContractAttachment.js'
import getContractAttachments from '../../database/getContractAttachments.js'

export interface DeleteContractAttachmentForm {
  contractAttachmentId: string
}

export default async function handler(
  request: Request<unknown, unknown, DeleteContractAttachmentForm>,
  response: Response
): Promise<void> {
  const contractAttachmentId = Number.parseInt(
    request.body.contractAttachmentId,
    10
  )

  // Get the attachment to verify it exists and get the contract ID
  const attachment = getContractAttachment(contractAttachmentId)
  if (attachment === undefined) {
    response.json({
      errorMessage: 'Attachment not found.',
      success: false
    })
    return
  }

  const contractId = attachment.contractId as number

  // Verify contract exists
  const contract = await getContract(contractId)
  if (contract === undefined) {
    response.json({
      errorMessage: 'Contract not found.',
      success: false,
    })
    return
  }

  try {
    const success = deleteRecord(
      'ContractAttachments',
      contractAttachmentId,
      request.session.user as User
    )

    if (!success) {
      response.json({
        errorMessage: 'Failed to delete attachment.',
        success: false,
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
      errorMessage: (error as Error).message,
      success: false,
    })
  }
}
