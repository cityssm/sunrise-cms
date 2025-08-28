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
    const success = deleteRecord(
      'ContractAttachments',
      contractAttachmentId,
      request.session.user as User
    )

    if (!success) {
      response.json({
        success: false,
        errorMessage: 'Failed to delete attachment.'
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